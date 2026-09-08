import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID,randomBytes,createHmac} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {createSignupAttempt,consumeSignupAttempt,parseSignupResult} from '../lib/meta/embedded-signup.js';
import {signupStore,rateLimit,connection} from '../lib/platform/store.js';
import {passwordHash,verifyPassword,requireOrigin,requireAdmin,hash} from '../lib/platform/security.js';
import {createSession,authenticate} from '../lib/platform/auth.js';
import {CredentialStore,encryptCredential,decryptCredential} from '../lib/platform/credentials.js';
import {GraphAPI} from '../lib/meta/graph.js';
import {completeSignup,disconnectConnection,isSimpleTemplate,readManagement,sendTestMessage} from '../lib/platform/whatsapp.js';
import {verifySignature,webhookRecords} from '../lib/meta/webhook.js';
import {parseMetaEvent} from '../src/lib/meta/embedded-signup.js';
import {api} from '../lib/platform/api.js';
import {getMetaConfig} from '../lib/meta/config.js';
import {runtimeConfig} from '../lib/platform/config.js';
import {exchangeAuthorizationCode} from '../lib/meta/graph-api.js';
import callbackHandler from '../api/meta/whatsapp/callback.js';
import { startSignup } from '../api/meta/whatsapp/signup/start.js';
import { persistWebhookRecords } from '../api/meta/whatsapp/webhook.js';
import { signupExtras } from '../lib/platform/config.js';

let engine,db,context,other,sessionCookie;
const savedEnv={...process.env};
before(async()=>{
  Object.assign(process.env,{DATABASE_URL:'test-only-not-a-server',APP_ORIGIN:'https://example.test',META_APP_ID:'1',META_CONFIG_ID:'2',META_APP_SECRET:'test-only-app-secret',META_GRAPH_API_VERSION:'v1.0',META_WEBHOOK_VERIFY_TOKEN:'test-only-verify',META_TOKEN_ENCRYPTION_KEY:randomBytes(32).toString('base64'),META_EMBEDDED_SIGNUP_EXTRAS:'{"feature":"test-only"}'});
  delete process.env.META_REDIRECT_URI;
  engine=new PGlite();
  await engine.exec(await readFile(new URL('../db/001-platform.sql',import.meta.url),'utf8'));
  await engine.exec(await readFile(new URL('../db/002-whatsapp-coexistence.sql',import.meta.url),'utf8'));
  db={query:async(sql,values)=>{const result=await engine.query(sql,values);return {...result,rowCount:result.affectedRows || result.rows.length};},connect:async()=>({...db,release(){}})};
  async function tenant(){
    const tenantId=randomUUID(),userId=randomUUID();
    await db.query('INSERT INTO tenants(id,name,slug) VALUES($1,$2,$3)',[tenantId,'Test enterprise',tenantId]);
    await db.query("INSERT INTO users(id,tenant_id,email,password_hash,role) VALUES($1,$2,$3,'not-used','admin')",[userId,tenantId,`${userId}@example.test`]);
    let cookie;await createSession({id:userId,tenant_id:tenantId},db,{setHeader:(key,value)=>{cookie=value;}});
    const ctx=await authenticate({headers:{cookie}},db);
    return {ctx,cookie};
  }
  const first=await tenant();context=first.ctx;sessionCookie=first.cookie;other=(await tenant()).ctx;
});
after(async()=>{await engine?.close();process.env=savedEnv;});

test('password hashing and server sessions: no plaintext, secure flags, role checks',async()=>{
  const encoded=await passwordHash('test-password-at-least-14');
  assert.equal(encoded.includes('test-password'),false);
  assert.equal(await verifyPassword('test-password-at-least-14',encoded),true);
  assert.equal(await verifyPassword('wrong',encoded),false);
  assert.match(sessionCookie,/HttpOnly; Secure; SameSite=Lax; Path=\//);
  assert.equal((await authenticate({headers:{cookie:sessionCookie}},db)).tenantId,context.tenantId);
  await assert.rejects(authenticate({headers:{}},db),{code:'authentication_required'});
  assert.throws(()=>requireAdmin({...context,role:'member'}),{code:'admin_required'});
  await db.query("UPDATE users SET role='member' WHERE id=$1",[context.userId]);
  await assert.rejects(authenticate({headers:{cookie:sessionCookie}},db),{code:'admin_required'});
  await db.query("UPDATE users SET role='admin' WHERE id=$1",[context.userId]);
});
test('state: SQL consumption, expired, replay and another tenant/session',async()=>{
  const store=signupStore(db),state=await createSignupAttempt(context,store);
  assert.equal(state.length,43);
  const rows=await db.query('SELECT state_hash FROM signup_attempts WHERE state_hash=$1',[hash(state)]);
  assert.equal(rows.rows[0].state_hash.includes(state),false);
  assert.equal(await consumeSignupAttempt(state,other,store),false);
  assert.equal(await consumeSignupAttempt(state,{...context,sessionId:other.sessionId},store),false);
  assert.equal(await consumeSignupAttempt(state,context,store),true);
  assert.equal(await consumeSignupAttempt(state,context,store),false);
  const expired=await createSignupAttempt(context,store,Date.now()-700000);
  assert.equal(await consumeSignupAttempt(expired,context,store),false);
});
test('concurrent SQL attempts have exactly one winner',async()=>{
  const store=signupStore(db),state=await createSignupAttempt(context,store);
  const outcomes=await Promise.all(Array.from({length:8},()=>consumeSignupAttempt(state,context,store)));
  assert.equal(outcomes.filter(Boolean).length,1);
});
test('Origin and parser reject hostile/ambiguous payloads',()=>{
  assert.throws(()=>requireOrigin({headers:{origin:'https://attacker.test'}}),{code:'invalid_origin'});
  requireOrigin({headers:{origin:'https://example.test'}});
  const valid={state:'a'.repeat(43),code:'test-only-code'};
  for(const invalid of [{...valid,error:''},{...valid,code:''},{...valid,tenantId:other.tenantId},{...valid,phone_number_id:1},{...valid,code:['bad']},{...valid,state:'short'}])assert.throws(()=>parseSignupResult(invalid));
});
test('shared rate limit survives separate store calls and resets when expired',async()=>{
  const key=randomUUID();await rateLimit(db,key,2,60);await rateLimit(db,key,2,60);
  await assert.rejects(rateLimit(db,key,2,60),{code:'rate_limited'});
  await db.query("UPDATE rate_limits SET expires_at=now()-interval '1 second' WHERE key=$1",[hash(key)]);
  await rateLimit(db,key,2,60);
});
test('credential encryption authenticates tenant and rejects tampering',async()=>{
  const key=randomBytes(32),id=randomUUID();
  const encrypted={id,...encryptCredential({token:'test-only-secret'},context.tenantId,id,key)};
  assert.equal(JSON.stringify(encrypted).includes('test-only-secret'),false);
  assert.equal(decryptCredential(encrypted,context.tenantId,key).token,'test-only-secret');
  assert.throws(()=>decryptCredential(encrypted,other.tenantId,key));
  assert.throws(()=>decryptCredential({...encrypted,tag:randomBytes(16).toString('base64')},context.tenantId,key));
  const vault=new CredentialStore(db),reference=await vault.storeCredential({tenantId:context.tenantId,provider:'meta_whatsapp',secret:{token:'test-only-secret'}});
  await assert.rejects(vault.get(other.tenantId,reference),{code:'credential_unavailable'});
  await vault.delete(context.tenantId,reference);
});

function metaFetch({invalidToken=false,invalidWaba=false,invalidPhone=false,metaError=false,phoneStatus='CONNECTED',isOnBizApp=true,platformType='CLOUD_API',onRegister}={}){
  return async(url,options)=>{
    assert.equal(String(url).includes('test-only-secret'),false);
    const path=new URL(url).pathname;
    let body;
    if(metaError)return {ok:false,json:async()=>({error:{message:'test-only-secret',code:190}})};
    if(path.endsWith('/oauth/access_token'))body={access_token:'test-only-secret'};
    else if(path==='/v1.0/')body=[{code:200,body:JSON.stringify({data:{is_valid:!invalidToken,app_id:'1',scopes:['whatsapp_business_management','whatsapp_business_messaging'],granular_scopes:[{scope:'whatsapp_business_management',target_ids:invalidWaba?[]:['111']}],expires_at:Math.floor(Date.now()/1000)+3600}})}];
    else if(path.endsWith('/111/phone_numbers'))body={data:invalidPhone?[]:[{id:'222',display_phone_number:'+15550000000',status:phoneStatus}]};
    else if(path.endsWith('/222/register')){onRegister?.();body={success:true};}
    else if(path.endsWith('/222'))body={id:'222',is_on_biz_app:isOnBizApp,platform_type:platformType};
    else if(path.endsWith('/111/subscribed_apps'))body={success:true};
    else if(path.endsWith('/111/message_templates'))body={data:[{id:'444',name:'test_template',language:'pt_BR',status:'APPROVED',components:[{type:'BODY',text:'Test template text'}]}]};
    else if(path.endsWith('/222/messages'))body={messages:[{id:'test-wamid'}]};
    else if(path.endsWith('/111'))body={id:'111',name:'Test WABA',owner_business_info:{id:'333'}};
    else assert.fail(`Unexpected test Graph path: ${path}`);
    if(options?.body)assert.ok(typeof options.body==='string' || options.body instanceof URLSearchParams);
    return {ok:true,json:async()=>body};
  };
}
test('Graph validation rejects invalid token, WABA, number, and sanitizes Meta errors',async()=>{
  const config={appId:'1',appSecret:'test-only-app-secret',graphVersion:'v1.0'};
  const hints={waba_id:'111',phone_number_id:'222',business_id:'333'};
  for(const [settings,code] of [[{invalidToken:true},'invalid_token'],[{invalidWaba:true},'invalid_waba'],[{invalidPhone:true},'invalid_phone_number'],[{metaError:true},'reauthorization_required']]){
    await assert.rejects(new GraphAPI(config,metaFetch(settings)).validate('test-only-secret',hints),{code});
  }
  assert.equal((await new GraphAPI(config,metaFetch()).validate('test-only-secret',hints)).businessId,'333');
});
test('real SQL callback pipeline persists encrypted connection; rejects duplicate and tenant hopping',async(t)=>{
  t.mock.method(globalThis,'fetch',metaFetch());
  const state=await createSignupAttempt(context,signupStore(db));
  const body={state,code:'test-only-code',waba_id:'111',phone_number_id:'222',signup_mode:'cloud_api'};
  await assert.rejects(completeSignup({body,db,context:other}),{code:'invalid_state'});
  const result=await completeSignup({body,db,context});
  assert.equal(result.status,'connected');
  await assert.rejects(completeSignup({body,db,context}),{code:'invalid_state'});
  const row=(await db.query('SELECT * FROM whatsapp_connections WHERE id=$1',[result.connection.id])).rows[0];
  assert.equal(row.tenant_id,context.tenantId);assert.ok(row.credential_reference);
  assert.equal(JSON.stringify(row).includes('test-only-secret'),false);
  await assert.rejects(connection(db,other,row.id),{code:'connection_not_found'});
  await assert.rejects(disconnectConnection({db,context:other,body:{connectionId:row.id}}),{code:'connection_not_found'});
  await disconnectConnection({db,context,body:{connectionId:row.id}});
  assert.equal((await db.query('SELECT status,credential_reference FROM whatsapp_connections WHERE id=$1',[row.id])).rows[0].status,'not_connected');
  assert.equal((await db.query('SELECT id FROM credentials WHERE id=$1',[row.credential_reference])).rowCount,0);
  assert.equal((await db.query("SELECT id FROM audit_events WHERE tenant_id=$1 AND event='connection_disconnected'",[context.tenantId])).rowCount,1);
});
test('signup mode is server-validated, persisted, and selects the official coexistence extras',async()=>{
  const started=await startSignup({db,context,body:{signupMode:'coexistence'}});
  assert.equal(started.signupMode,'coexistence');
  assert.deepEqual(started.extras,{setup:{},featureType:'whatsapp_business_app_onboarding',sessionInfoVersion:'3'});
  assert.equal((await db.query('SELECT signup_mode FROM signup_attempts WHERE state_hash=$1',[hash(started.state)])).rows[0].signup_mode,'coexistence');
  assert.deepEqual(signupExtras(runtimeConfig(),'coexistence'),started.extras);
  await assert.rejects(startSignup({db,context,body:{signupMode:'standard'}}),{code:'invalid_signup_mode'});
  await assert.rejects(startSignup({db,context,body:{}}),{code:'invalid_signup_mode'});
});
test('coexistence callback resolves the sole validated WABA phone when Meta omits its id',async(t)=>{
  t.mock.method(globalThis,'fetch',metaFetch());
  const state=await createSignupAttempt(context,signupStore(db),'coexistence');
  const result=await completeSignup({db,context,body:{state,code:'test-only-code',waba_id:'111',signup_mode:'coexistence'}});
  assert.equal(result.connection.phoneNumberId,'222');
  assert.equal(result.connection.signupMode,'coexistence');
  assert.equal(result.connection.isOnBizApp,true);
  assert.equal(result.connection.platformType,'CLOUD_API');
});
test('a callback cannot switch the persisted signup mode',async()=>{
  for (const [startedMode,returnedMode] of [['cloud_api','coexistence'],['coexistence','cloud_api']]) {
    const state=await createSignupAttempt(context,signupStore(db),startedMode);
    await assert.rejects(completeSignup({db,context,body:{state,code:'test-only-code',waba_id:'111',phone_number_id:'222',signup_mode:returnedMode}}),{code:'signup_mode_mismatch'});
    assert.equal((await db.query('SELECT outcome FROM signup_attempts WHERE state_hash=$1',[hash(state)])).rows[0].outcome,'failed');
  }
});
test('coexistence fails closed when Graph cannot prove the Business App and Cloud API platform',async(t)=>{
  for (const options of [{isOnBizApp:false},{platformType:'ON_PREMISE'}]) {
    t.mock.method(globalThis,'fetch',metaFetch(options));
    const state=await createSignupAttempt(context,signupStore(db),'coexistence');
    await assert.rejects(completeSignup({db,context,body:{state,code:'test-only-code',waba_id:'111',signup_mode:'coexistence'}}),{code:'coexistence_not_confirmed'});
    t.mock.restoreAll();
  }
});
test('coexistence never registers a number and Cloud API still registers when required',async(t)=>{
  let coexistenceRegisters=0,cloudRegisters=0;
  t.mock.method(globalThis,'fetch',metaFetch({phoneStatus:'PENDING',onRegister:()=>coexistenceRegisters++}));
  const coexistenceState=await createSignupAttempt(context,signupStore(db),'coexistence');
  await completeSignup({db,context,body:{state:coexistenceState,code:'test-only-code',waba_id:'111',signup_mode:'coexistence'}});
  assert.equal(coexistenceRegisters,0);
  t.mock.restoreAll();
  t.mock.method(globalThis,'fetch',metaFetch({phoneStatus:'PENDING',onRegister:()=>cloudRegisters++}));
  const cloudState=await createSignupAttempt(context,signupStore(db),'cloud_api');
  await completeSignup({db,context,body:{state:cloudState,code:'test-only-code',waba_id:'111',phone_number_id:'222',signup_mode:'cloud_api'}});
  assert.equal(cloudRegisters,1);
});
test('callback failure is audited without storing code or Meta error text',async()=>{
  const state=await createSignupAttempt(context,signupStore(db));
  await assert.rejects(completeSignup({db,context,body:{state,error:'access_denied'}}),{code:'meta_authorization_cancelled'});
  const attempts=await db.query('SELECT outcome FROM signup_attempts WHERE state_hash=$1',[hash(state)]);
  assert.equal(attempts.rows[0].outcome,'failed');
  const events=await db.query('SELECT * FROM audit_events WHERE tenant_id=$1',[context.tenantId]);
  assert.equal(JSON.stringify(events.rows).includes('access_denied'),false);
});
test('HTTP guard rejects missing session, bad Origin, oversized body and non-admin',async()=>{
  const handler=api('POST',async()=>({ok:true}),{getDatabase:()=>db});
  async function call(changes){const req={method:'POST',url:'/test',headers:{origin:'https://example.test','content-type':'application/json',cookie:sessionCookie},body:{},...changes};const res={setHeader(){},end(value){this.body=JSON.parse(value);}};await handler(req,res);return res;}
  assert.equal((await call({})).statusCode,200);
  assert.equal((await call({headers:{origin:'https://attacker.test'}})).statusCode,403);
  assert.equal((await call({headers:{origin:'https://example.test'}})).statusCode,401);
  assert.equal((await call({body:'x'.repeat(9000)})).statusCode,400);
});
test('webhook signature is computed over exact bytes; records have no message content',()=>{
  const raw=Buffer.from('{"test":true}'),secret='test-only-secret';
  const signature='sha256='+createHmac('sha256',secret).update(raw).digest('hex');
  assert.equal(verifySignature(raw,signature,secret),true);
  assert.equal(verifySignature(Buffer.from('{}'),signature,secret),false);
  const payload={object:'whatsapp_business_account',entry:[{id:'111',changes:[{field:'messages',value:{metadata:{phone_number_id:'222'},messages:[{id:'test-wamid',text:{body:'private message'},from:'private recipient'}]}}]}]};
  const first=webhookRecords(payload),second=webhookRecords(payload);
  assert.equal(first[0].eventHash,second[0].eventHash);assert.equal(JSON.stringify(first).includes('private'),false);
});
test('webhooks persist smb echoes and PARTNER_REMOVED without retaining payload content',async()=>{
  const payload={object:'whatsapp_business_account',entry:[{id:'111',changes:[
    {field:'smb_message_echoes',value:{metadata:{phone_number_id:'222'},smb_message_echoes:[{id:'echo-1',text:{body:'private echo'}}]}},
    {field:'history',value:{metadata:{phone_number_id:'222'},messages:[{text:{body:'history'}}]}},
    {field:'smb_app_state_sync',value:{metadata:{phone_number_id:'222'},state:'SYNCED'}},
    {field:'account_update',value:{event:'PARTNER_REMOVED',sensitive:'not stored'}},
  ]}]};
  const records=webhookRecords(payload);
  assert.deepEqual(records.map((item)=>item.kind),['smb_message_echo','history','smb_app_state_sync','account_update']);
  assert.equal(JSON.stringify(records).includes('private'),false);
  await persistWebhookRecords(db,records);
  const persisted=await db.query("SELECT kind,delivery_status FROM webhook_events WHERE connection_id IN (SELECT id FROM whatsapp_connections WHERE tenant_id=$1) ORDER BY received_at DESC",[context.tenantId]);
  assert.ok(persisted.rows.some((row)=>row.kind==='smb_message_echo'));
  assert.ok(persisted.rows.some((row)=>row.kind==='account_update' && row.delivery_status==='PARTNER_REMOVED'));
  assert.equal((await db.query("SELECT status FROM whatsapp_connections WHERE tenant_id=$1 AND phone_number_id='222'",[context.tenantId])).rows[0].status,'reauthorization_required');
  const foreign=await db.query("SELECT count(*)::int AS count FROM webhook_events WHERE tenant_id=$1",[other.tenantId]);
  assert.equal(foreign.rows[0].count,0);
});
test('SDK event exact origin, stable source and current payload variants are enforced',()=>{
  const root={},popup={opener:root};popup.top=popup;
  const data=JSON.stringify({type:'WA_EMBEDDED_SIGNUP',event:'FINISH',data:{waba_id:'111',phone_number_id:'222'}});
  const event={origin:'https://www.facebook.com',source:popup,data};
  assert.ok(parseMetaEvent(event,root));
  assert.ok(parseMetaEvent({...event,source:{}},root));
  assert.ok(parseMetaEvent({...event,data:JSON.parse(data)},root));
  assert.ok(parseMetaEvent({...event,data:JSON.stringify({type:'WA_EMBEDDED_SIGNUP',event:'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING',data:{waba_id:'111'}})},root));
  assert.equal(parseMetaEvent({...event,origin:'https://facebook.com.attacker.test'},root),null);
  assert.equal(parseMetaEvent(event,root,{}),null);
  assert.equal(parseMetaEvent({...event,data:'not-json'},root),null);
  assert.equal(parseMetaEvent({...event,source:root},root),null);
});
test('message demo accepts only approved text templates without variables',()=>{
  assert.equal(isSimpleTemplate({status:'APPROVED',components:[{type:'BODY',text:'Test'}]}),true);
  assert.equal(isSimpleTemplate({status:'APPROVED',components:[{type:'BODY',text:'Hi {{1}}'}]}),false);
  assert.equal(isSimpleTemplate({status:'PENDING',components:[]}),false);
});
test('management and message endpoints use tenant credential; duplicate sends are suppressed',async(t)=>{
  let sends=0;
  const fixture=metaFetch();
  t.mock.method(globalThis,'fetch',async(url,options)=>{if(new URL(url).pathname.endsWith('/messages'))sends++;return fixture(url,options);});
  const state=await createSignupAttempt(context,signupStore(db));
  const result=await completeSignup({db,context,body:{state,code:'test-code',waba_id:'111',phone_number_id:'222',signup_mode:'cloud_api'}});
  const connectionId=result.connection.id;
  const assets=await readManagement({db,context,body:{connectionId}});
  assert.equal(assets.waba.id,'111');assert.equal(assets.templates[0].canTest,true);
  await assert.rejects(readManagement({db,context:other,body:{connectionId}}),{code:'connection_not_found'});
  const body={connectionId,requestId:randomUUID(),recipient:'+15550000000',templateName:'test_template',language:'pt_BR',recipientAuthorized:true};
  assert.equal((await sendTestMessage({db,context,body})).accepted,true);
  assert.equal((await sendTestMessage({db,context,body})).duplicate,true);
  assert.equal(sends,1);
  await assert.rejects(sendTestMessage({db,context,body:{...body,recipient:'+15550000001'}}),{code:'idempotency_conflict'});
  await assert.rejects(sendTestMessage({db,context:other,body}),{code:'connection_not_found'});
  const ledger=await db.query('SELECT * FROM message_requests WHERE id=$1',[body.requestId]);
  assert.equal(JSON.stringify(ledger.rows).includes('+15550000000'),false);
  const events=await db.query("SELECT event FROM audit_events WHERE tenant_id=$1 AND event IN ('management_test_executed','message_test_sent')",[context.tenantId]);
  assert.equal(events.rowCount,2);
});
test('ambiguous external send is durable and never retried automatically',async(t)=>{
  let sends=0;const fixture=metaFetch();
  t.mock.method(globalThis,'fetch',async(url,options)=>{if(new URL(url).pathname.endsWith('/messages')){sends++;throw new Error('sensitive upstream detail');}return fixture(url,options);});
  const row=(await db.query("SELECT id FROM whatsapp_connections WHERE tenant_id=$1 AND status='connected'",[context.tenantId])).rows[0];
  const body={connectionId:row.id,requestId:randomUUID(),recipient:'+15550000000',templateName:'test_template',language:'pt_BR',recipientAuthorized:true};
  await assert.rejects(sendTestMessage({db,context,body}),{code:'message_outcome_unknown'});
  await assert.rejects(sendTestMessage({db,context,body}),{code:'message_outcome_unknown'});
  assert.equal(sends,1);
  assert.equal((await db.query('SELECT status FROM message_requests WHERE id=$1',[body.requestId])).rows[0].status,'unknown');
});


test('SDK configuration needs no redirect URI and retains canonical HTTPS origin validation',()=>{
  assert.ok(runtimeConfig());
  const config=getMetaConfig(process.env);
  assert.equal(config.origin,'https://example.test');
  assert.equal('redirectUri' in config,false);
  assert.deepEqual(getMetaConfig({...process.env,META_REDIRECT_URI:'https://legacy.test/callback'}),config);
  for(const origin of ['', 'http://example.test', 'https://example.test/', 'https://example.test/path', 'https://user:pass@example.test', 'https://example.test?x=1', 'https://example.test#x']) {
    assert.equal(getMetaConfig({...process.env,APP_ORIGIN:origin}),null);
  }
});
test('SDK code exchange omits redirect_uri even with legacy configuration',async()=>{
  const config={...getMetaConfig(process.env),redirectUri:'https://legacy.test/callback'};
  const result=await exchangeAuthorizationCode('test-only-code',config,async(url,options)=>{
    assert.equal(url,'https://graph.facebook.com/v1.0/oauth/access_token');
    assert.deepEqual(Object.fromEntries(options.body),{client_id:'1',client_secret:'test-only-app-secret',code:'test-only-code'});
    assert.equal(options.body.has('redirect_uri'),false);
    assert.equal(options.method,'POST');
    return {ok:true,json:async()=>({access_token:'test-only-token'})};
  });
  assert.equal(result.accessToken,'test-only-token');
});
test('Embedded Signup callback remains POST-only, rejecting OAuth GET',async()=>{
  const headers={};
  const res={setHeader(key,value){headers[key]=value;},end(value){this.body=JSON.parse(value);}};
  await callbackHandler({method:'GET',url:'/api/meta/whatsapp/callback?code=test',headers:{}},res);
  assert.equal(res.statusCode,405);
  assert.equal(headers.Allow,'POST');
});
