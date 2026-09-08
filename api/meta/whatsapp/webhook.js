import { timingSafeEqual } from 'node:crypto';
import { database, transaction } from '../../../lib/platform/db.js';
import { HttpError } from '../../../lib/platform/security.js';
import { respond } from '../../../lib/meta/http.js';
import { verifySignature, rawBody, webhookRecords } from '../../../lib/meta/webhook.js';
export const config = { api: { bodyParser: false } };
export async function persistWebhookRecords(tx, records) {
  for (const record of records) {
    const lookup = record.phoneId
      ? await tx.query("SELECT id,tenant_id FROM whatsapp_connections WHERE waba_id=$1 AND phone_number_id=$2 AND status IN ('connected','pending')", [record.wabaId,record.phoneId])
      : await tx.query("SELECT id,tenant_id FROM whatsapp_connections WHERE waba_id=$1 AND status IN ('connected','pending')", [record.wabaId]);
    for (const row of lookup.rows) {
      // A WABA-level update can target more than one local number. Scope the durable
      // deduplication key to the local connection while retaining source-event idempotence.
      const connectionEventHash = `${record.eventHash}:${row.id}`;
      const inserted = await tx.query('INSERT INTO webhook_events(event_hash,tenant_id,connection_id,kind,delivery_status) VALUES($1,$2,$3,$4,$5) ON CONFLICT(event_hash) DO NOTHING RETURNING connection_id', [connectionEventHash, row.tenant_id, row.id, record.kind, record.status]);
      if (inserted.rowCount && record.kind === 'account_update' && record.status === 'PARTNER_REMOVED') {
        await tx.query("UPDATE whatsapp_connections SET status='reauthorization_required',updated_at=now() WHERE id=$1 AND tenant_id=$2", [row.id, row.tenant_id]);
      }
    }
  }
}
export default async function handler(req,res) {
  try {
    if (req.method === 'GET') {
      const url = new URL(req.url,'https://webhook.invalid');
      const token = url.searchParams.get('hub.verify_token') || '';
      const expected = process.env.META_WEBHOOK_VERIFY_TOKEN;
      if (!expected) throw new HttpError(503,'configuration_required');
      const receivedToken=Buffer.from(token),expectedToken=Buffer.from(expected);
      const challenge = url.searchParams.get('hub.challenge');
      if (url.searchParams.get('hub.mode') !== 'subscribe' || receivedToken.length !== expectedToken.length || !timingSafeEqual(receivedToken,expectedToken) || !challenge || !/^\d{1,100}$/.test(challenge)) throw new HttpError(403,'invalid_verification');
      res.setHeader('Content-Type','text/plain'); res.setHeader('Cache-Control','no-store'); res.statusCode=200; return res.end(challenge);
    }
    if (req.method !== 'POST') { res.setHeader('Allow','GET, POST'); throw new HttpError(405,'method_not_allowed'); }
    if (!process.env.META_APP_SECRET) throw new HttpError(503,'configuration_required');
    const raw = await rawBody(req);
    if (!verifySignature(raw,req.headers['x-hub-signature-256'],process.env.META_APP_SECRET)) throw new HttpError(403,'invalid_signature');
    let body;
    try { body=JSON.parse(raw.toString('utf8')); } catch { throw new HttpError(400,'invalid_webhook'); }
    const records=webhookRecords(body);
    await transaction(async (tx) => {
      await persistWebhookRecords(tx, records);
    },database());
    return respond(res,200,{received:true});
  } catch(error) { return respond(res,error instanceof HttpError ? error.status : 500,{error:error instanceof HttpError ? error.code : 'webhook_failed'}); }
}
