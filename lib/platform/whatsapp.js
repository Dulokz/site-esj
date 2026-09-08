import { randomUUID, randomInt, createHmac } from 'node:crypto';
import { api } from './api.js';
import { runtimeConfig } from './config.js';
import { transaction, lockTenant } from './db.js';
import { CredentialStore } from './credentials.js';
import { HttpError, hash, objectBody, uuid } from './security.js';
import { audit, connection, signupStore } from './store.js';
import { GraphAPI } from '../meta/graph.js';
import { exchangeAuthorizationCode } from '../meta/graph-api.js';
import { consumeSignupAttemptDetailed, parseSignupResult } from '../meta/embedded-signup.js';
import { callbackPayloadStructure,metaCallbackDiagnostic,safeErrorCode } from './meta-diagnostics.js';

const publicConnection = (row) => ({ id: row.id, wabaId: row.waba_id, phoneNumberId: row.phone_number_id, displayPhoneNumber: row.display_phone_number, status: row.status, connectedAt: row.connected_at, validatedAt: row.validated_at });
const needsReauth = (error) => ['reauthorization_required','invalid_token','missing_permissions','invalid_waba','invalid_phone_number','invalid_business'].includes(error.code);

export async function provision(db, context, id, graph) {
  metaCallbackDiagnostic('provision_started',{});
  try {
    // Keep the same encrypted PIN across partial failures; never generate a new PIN on retry.
    const outcome=await transaction(async (tx) => {
      await lockTenant(tx, context.tenantId);
      const row = await connection(tx, context, id, ['pending','connected','error']);
      const secret = await new CredentialStore(tx).get(context.tenantId, row.credential_reference);
      try {
      let verified = await graph.validate(secret.token, { waba_id: row.waba_id, phone_number_id: row.phone_number_id, business_id: row.meta_business_id });
      const subscribed = await graph.request(`${row.waba_id}/subscribed_apps`, secret.token, { method: 'POST' });
      if (subscribed.success !== true) throw new HttpError(502, 'subscription_failed');
      if (verified.phone.status !== 'CONNECTED' && !secret.coexistence) {
        // Coexistence is never forced: an already-connected app number is not registered again.
        const registered = await graph.request(`${row.phone_number_id}/register`, secret.token, { method: 'POST', body: { messaging_product: 'whatsapp', pin: secret.registrationPin } });
        if (registered.success !== true) throw new HttpError(502, 'registration_failed');
        verified = await graph.validate(secret.token, { waba_id: row.waba_id, phone_number_id: row.phone_number_id, business_id: row.meta_business_id });
      }
      const status = verified.phone.status === 'CONNECTED' ? 'connected' : 'pending';
      const { rows } = await tx.query(`UPDATE whatsapp_connections SET status=$3, validated_at=now(), updated_at=now(), connected_at=CASE WHEN $3='connected' THEN coalesce(connected_at,now()) ELSE connected_at END WHERE id=$1 AND tenant_id=$2 RETURNING *`, [id, context.tenantId, status]);
      if (status === 'connected' && row.status !== 'connected') await audit(tx, context, 'connection_connected', id);
        return { connection: publicConnection(rows[0]) };
      } catch (error) {
        await tx.query('UPDATE whatsapp_connections SET status=$3,updated_at=now() WHERE id=$1 AND tenant_id=$2', [id, context.tenantId, needsReauth(error) ? 'reauthorization_required' : 'error']);
        return { error: error instanceof HttpError ? error.code : 'provisioning_failed' };
      }
    }, db);
    metaCallbackDiagnostic('provision_finished',{success:!outcome.error,status:outcome.connection?.status||null,reason:outcome.error||null});
    return outcome;
  } catch(error) {
    metaCallbackDiagnostic('provision_finished',{success:false,status:null,reason:safeErrorCode(error,'provisioning_failed')});
    throw error;
  }
}

export async function completeSignup({ body, db, context }) {
  metaCallbackDiagnostic('complete_signup_started',{payload:callbackPayloadStructure(body)});
  let config;
  try {config=runtimeConfig();}
  catch(error){metaCallbackDiagnostic('complete_signup_finished',{success:false,reason:safeErrorCode(error,'configuration_required')});throw error;}
  let result;
  try { result = parseSignupResult(body); } catch {metaCallbackDiagnostic('complete_signup_finished',{success:false,reason:'invalid_parameters'});throw new HttpError(400, 'invalid_parameters');}
  const stateStatus=await consumeSignupAttemptDetailed(result.state,context,signupStore(db));
  metaCallbackDiagnostic('state_checked',{located:Boolean(stateStatus.located),expired:Boolean(stateStatus.expired),used:Boolean(stateStatus.used),contextMatch:Boolean(stateStatus.contextMatch),consumed:Boolean(stateStatus.consumed),reason:stateStatus.reason});
  if (!stateStatus.consumed){metaCallbackDiagnostic('complete_signup_finished',{success:false,reason:'invalid_state'});throw new HttpError(403, 'invalid_state');}
  let id;
  try {
    if (result.error) throw new HttpError(400, 'meta_authorization_cancelled');
    if (!result.waba_id) throw new HttpError(400, 'missing_assets');
    const graph = new GraphAPI(config);
    const { accessToken } = await exchangeAuthorizationCode(result.code, config);
    const verified = await graph.validate(accessToken, result);
    id = await transaction(async (tx) => {
      await lockTenant(tx, context.tenantId);
      const active = await tx.query("SELECT id FROM signup_attempts WHERE state_hash=$1 AND tenant_id=$2 AND outcome='pending'", [hash(result.state), context.tenantId]);
      if (!active.rowCount) throw new HttpError(409, 'signup_superseded');
      const existing = await tx.query('SELECT * FROM whatsapp_connections WHERE phone_number_id=$1', [verified.phone.id]);
      if (existing.rows[0] && existing.rows[0].tenant_id !== context.tenantId) throw new HttpError(409, 'asset_already_connected');
      // One WABA belongs to one local tenant, even if it has multiple numbers.
      const owner = await tx.query("SELECT id FROM whatsapp_connections WHERE waba_id=$1 AND tenant_id<>$2 AND status<>'not_connected'", [verified.waba.id, context.tenantId]);
      if (owner.rowCount) throw new HttpError(409, 'asset_already_connected');
      // Serialize WABA ownership across tenants to avoid concurrent claims.
      await tx.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [`waba:${verified.waba.id}`]);
      const claim = await tx.query("SELECT id FROM whatsapp_connections WHERE waba_id=$1 AND tenant_id<>$2 AND status<>'not_connected'", [verified.waba.id, context.tenantId]);
      if (claim.rowCount) throw new HttpError(409, 'asset_already_connected');
      const old = existing.rows[0];
      const vault = new CredentialStore(tx);
      const priorSecret = old?.credential_reference ? await vault.get(context.tenantId,old.credential_reference) : null;
      const reference = await vault.storeCredential({ tenantId: context.tenantId, provider: 'meta_whatsapp', secret: { token: accessToken, registrationPin: priorSecret?.registrationPin || String(randomInt(0, 1000000)).padStart(6,'0'), coexistence:result.signup_mode==='coexistence' } });
      const connectionId = old?.id || randomUUID();
      await tx.query(`INSERT INTO whatsapp_connections(id,tenant_id,meta_business_id,waba_id,phone_number_id,display_phone_number,status,credential_reference,validated_at)
        VALUES($1,$2,$3,$4,$5,$6,'pending',$7,now()) ON CONFLICT(id) DO UPDATE SET meta_business_id=excluded.meta_business_id,waba_id=excluded.waba_id,
        display_phone_number=excluded.display_phone_number,status='pending',credential_reference=excluded.credential_reference,validated_at=now(),updated_at=now()`,
      [connectionId, context.tenantId, verified.businessId, verified.waba.id, verified.phone.id, verified.phone.display_phone_number, reference]);
      if (old?.credential_reference) await vault.delete(context.tenantId, old.credential_reference);
      await audit(tx, context, 'credential_stored', connectionId);
      return connectionId;
    }, db);
    const outcome = await provision(db, context, id, graph);
    if (outcome.error) throw new HttpError(409, outcome.error);
    await transaction(async (tx) => {
      await tx.query("UPDATE signup_attempts SET outcome='completed' WHERE state_hash=$1 AND tenant_id=$2", [hash(result.state), context.tenantId]);
      await audit(tx, context, 'signup_completed', id);
    }, db);
    metaCallbackDiagnostic('complete_signup_finished',{success:true,status:outcome.connection.status});
    return { status: outcome.connection.status, connection: outcome.connection };
  } catch (error) {
    await transaction(async (tx) => {
      await tx.query("UPDATE signup_attempts SET outcome='failed' WHERE state_hash=$1 AND tenant_id=$2 AND outcome='pending'", [hash(result.state), context.tenantId]);
      await audit(tx, context, 'signup_failed', id);
    }, db);
    metaCallbackDiagnostic('complete_signup_finished',{success:false,reason:safeErrorCode(error)});
    throw error;
  }
}
export const callbackHandler = api('POST', completeSignup, { limit: 10, diagnosticScope:'meta_embedded_signup_callback' });

export const statusHandler = api('GET', async ({ db, context }) => {
  const { rows } = await db.query('SELECT * FROM whatsapp_connections WHERE tenant_id=$1 ORDER BY created_at DESC', [context.tenantId]);
  const attempts = await db.query('SELECT outcome,expires_at,consumed_at FROM signup_attempts WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 1', [context.tenantId]);
  let canConnect = true;
  try { runtimeConfig(); } catch { canConnect = false; }
  const pending = attempts.rows[0]?.outcome === 'pending' && new Date(attempts.rows[0].expires_at).getTime() > Date.now();
  const statuses = rows.map((row) => row.status);
  const status = ['connected','reauthorization_required','pending','error'].find((value) => statuses.includes(value)) || (pending ? 'pending' : attempts.rows[0]?.outcome === 'failed' ? 'error' : 'not_connected');
  return { status, canConnect, connections: rows.map(publicConnection) };
});

export const refreshHandler = api('POST', async ({ db, context, body }) => {
  objectBody(body, ['connectionId']);
  const result = await provision(db, context, uuid(body.connectionId), new GraphAPI(runtimeConfig()));
  if (result.error) throw new HttpError(409, result.error);
  return result;
}, { limit: 5 });

export async function disconnectConnection({ db, context, body }) {
  objectBody(body, ['connectionId']);
  const id = uuid(body.connectionId);
  return transaction(async (tx) => {
    await lockTenant(tx, context.tenantId);
    const row = await connection(tx, context, id, ['connected','pending','error','reauthorization_required','not_connected']);
    await tx.query("UPDATE signup_attempts SET consumed_at=coalesce(consumed_at,now()),outcome='cancelled' WHERE tenant_id=$1 AND outcome='pending'", [context.tenantId]);
    await tx.query("UPDATE whatsapp_connections SET status='not_connected',credential_reference=NULL,updated_at=now() WHERE id=$1 AND tenant_id=$2", [id, context.tenantId]);
    if (row.credential_reference) await new CredentialStore(tx).delete(context.tenantId, row.credential_reference);
    if (row.status !== 'not_connected') await audit(tx, context, 'connection_disconnected', id);
    return { status: 'not_connected' };
  }, db);
}
export const disconnectHandler = api('POST', disconnectConnection);

export async function readManagement({ db, context, body }) {
  objectBody(body, ['connectionId']);
  const id = uuid(body.connectionId);
  const graph = new GraphAPI(runtimeConfig());
  const result = await transaction(async (tx) => {
    await lockTenant(tx, context.tenantId);
    const row = await connection(tx, context, id);
    const secret = await new CredentialStore(tx).get(context.tenantId, row.credential_reference);
    try {
      const verified = await graph.validate(secret.token, { waba_id: row.waba_id, phone_number_id: row.phone_number_id, business_id: row.meta_business_id });
      const numbers = await graph.list(`${row.waba_id}/phone_numbers`, secret.token, 'id,display_phone_number,verified_name,status');
      const templates = await graph.templates(row.waba_id, secret.token);
      await audit(tx, context, 'management_test_executed', id);
      await tx.query('UPDATE whatsapp_connections SET validated_at=now() WHERE id=$1 AND tenant_id=$2', [id,context.tenantId]);
      return { waba: { id: verified.waba.id, name: verified.waba.name }, numbers: numbers.map(({ id,display_phone_number,verified_name,status }) => ({ id,displayPhoneNumber: display_phone_number,verifiedName: verified_name,status })), templates: templates.map(({ id,name,language,status,components }) => ({ id,name,language,status,canTest: isSimpleTemplate({status,components}) })) };
    } catch (error) {
      if (needsReauth(error)) await tx.query("UPDATE whatsapp_connections SET status='reauthorization_required',updated_at=now() WHERE id=$1 AND tenant_id=$2", [id,context.tenantId]);
      return { error: error instanceof HttpError ? error.code : 'management_failed' };
    }
  }, db);
  if (result.error) throw new HttpError(409, result.error);
  return result;
}
export const managementHandler = api('POST', readManagement, {limit:10});

export function isSimpleTemplate(template) {
  return template.status === 'APPROVED' && Array.isArray(template.components) && template.components.some((part)=>part.type==='BODY') && template.components.every((part) =>
    ['BODY','FOOTER','HEADER'].includes(part.type) && (!part.format || part.format === 'TEXT') && typeof part.text === 'string' && !part.text.includes('{{'));
}

export async function sendTestMessage({ db, context, body }) {
  objectBody(body, ['connectionId','requestId','recipient','templateName','language','recipientAuthorized']);
  const id = uuid(body.connectionId), requestId = uuid(body.requestId);
  if (body.recipientAuthorized !== true || typeof body.recipient !== 'string' || !/^\+[1-9]\d{7,14}$/.test(body.recipient) || typeof body.templateName !== 'string' || !/^[a-z0-9_]{1,512}$/.test(body.templateName) || typeof body.language !== 'string' || !/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(body.language)) throw new HttpError(400, 'invalid_parameters');
  const config = runtimeConfig();
  // Keyed digest prevents offline enumeration of recipients from the request ledger.
  const requestHash = createHmac('sha256', process.env.META_TOKEN_ENCRYPTION_KEY).update(JSON.stringify([id,body.recipient,body.templateName,body.language])).digest('hex');
  const claimed = await transaction(async (tx) => {
    await lockTenant(tx, context.tenantId);
    await connection(tx, context, id);
    const result = await tx.query("INSERT INTO message_requests(id,tenant_id,connection_id,request_hash,status) VALUES($1,$2,$3,$4,'sending') ON CONFLICT(id) DO NOTHING RETURNING id", [requestId,context.tenantId,id,requestHash]);
    if (result.rowCount) return true;
    const prior = await tx.query('SELECT status,request_hash FROM message_requests WHERE id=$1 AND tenant_id=$2 AND connection_id=$3', [requestId,context.tenantId,id]);
    if (!prior.rows[0] || prior.rows[0].request_hash !== requestHash) throw new HttpError(409, 'idempotency_conflict');
    if (prior.rows[0].status === 'sent') return false;
    throw new HttpError(409, 'message_outcome_unknown');
  }, db);
  if (!claimed) return { accepted: true, duplicate: true };
  const graph = new GraphAPI(config);
  const result = await transaction(async (tx) => {
    await lockTenant(tx, context.tenantId);
    const row = await connection(tx, context, id);
    const secret = await new CredentialStore(tx).get(context.tenantId, row.credential_reference);
    let dispatched = false;
    try {
      const template = (await graph.templates(row.waba_id, secret.token)).find((item) => item.name === body.templateName && item.language === body.language);
      if (!template || !isSimpleTemplate(template)) throw new HttpError(400, 'template_not_supported');
      dispatched = true;
      const sent = await graph.request(`${row.phone_number_id}/messages`, secret.token, { method:'POST', body: { messaging_product:'whatsapp', to: body.recipient.slice(1), type:'template', template:{ name:template.name, language:{ code:template.language } } } });
      if (typeof sent.messages?.[0]?.id !== 'string') throw new HttpError(502,'message_outcome_unknown');
      await tx.query("UPDATE message_requests SET status='sent',meta_message_id=$3 WHERE id=$1 AND tenant_id=$2", [requestId,context.tenantId,sent.messages[0].id]);
      await audit(tx, context, 'message_test_sent', id);
      return { accepted: true };
    } catch (error) {
      await tx.query('UPDATE message_requests SET status=$3 WHERE id=$1 AND tenant_id=$2', [requestId,context.tenantId,dispatched ? 'unknown' : 'failed']);
      if (needsReauth(error)) await tx.query("UPDATE whatsapp_connections SET status='reauthorization_required' WHERE id=$1 AND tenant_id=$2", [id,context.tenantId]);
      return { error: dispatched ? 'message_outcome_unknown' : error instanceof HttpError ? error.code : 'message_failed' };
    }
  }, db);
  if (result.error) throw new HttpError(409, result.error);
  return result;
}
export const messageHandler = api('POST', sendTestMessage, {limit:3});
