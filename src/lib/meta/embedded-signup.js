let sdkPromise;
const officialMetaOrigins=new Set(['https://www.facebook.com','https://web.facebook.com']);
const safeType=(value)=>typeof value==='string' && /^[A-Z0-9_]{1,64}$/i.test(value)?value:null;
const safeOrigin=(value)=>{
  if(typeof value!=='string' || value.length>256)return value?'invalid':'missing';
  try {const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.origin:'invalid';} catch {return 'invalid';}
};

// TEMPORARY: remove after the next successful production Embedded Signup trace.
export function metaSignupDiagnostic(stage,details={}) {
  console.info('[ESJ Meta Embedded Signup][TEMP]',{at:new Date().toISOString(),stage,...details});
}

export async function apiRequest(path, body, signal, onResponse) {
  let response;
  try {
    response = await fetch(path, { method: body === undefined ? 'GET':'POST', credentials:'same-origin', cache:'no-store', headers:body === undefined ? {} : {'Content-Type':'application/json'}, body:body === undefined ? undefined : JSON.stringify(body), signal:signal ? AbortSignal.any([signal,AbortSignal.timeout(90000)]) : AbortSignal.timeout(90000) });
  } catch { throw Object.assign(new Error('network_error'), {code:'network_error'}); }
  onResponse?.({status:response.status,ok:response.ok});
  let result;
  try { result=await response.json(); } catch { throw Object.assign(new Error('configuration_required'),{code:'configuration_required'}); }
  if(!response.ok) throw Object.assign(new Error(result.error || 'request_failed'),{code:result.error || 'request_failed',status:response.status});
  return result;
}
export function loadMetaSDK(config) {
  if(sdkPromise) return sdkPromise;
  sdkPromise=new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{sdkPromise=null;reject(new Error('sdk_unavailable'));},15000);
    const initialize=()=>{
      clearTimeout(timer);
      if(!window.FB) {sdkPromise=null;reject(new Error('sdk_unavailable'));return;}
      window.FB.init({appId:config.appId,version:config.graphVersion,xfbml:false,cookie:false});
      resolve();
    };
    if(window.FB) return initialize();
    let script=document.getElementById('esj-meta-sdk');
    if(!script) {
      script=document.createElement('script'); script.id='esj-meta-sdk';
      script.src='https://connect.facebook.net/pt_BR/sdk.js'; script.async=true; script.defer=true;
      script.referrerPolicy='strict-origin-when-cross-origin';
      script.onload=initialize;
      script.onerror=()=>{clearTimeout(timer);sdkPromise=null;script.remove();reject(new Error('sdk_unavailable'));};
      document.head.appendChild(script);
    } else script.addEventListener('load',initialize,{once:true});
  });
  return sdkPromise;
}
function inspectMetaEvent(event,rootWindow,expectedWindow) {
  if(!officialMetaOrigins.has(event.origin))return {reason:'unsupported_origin'};
  if(!event.source || event.source===rootWindow)return {reason:'invalid_source'};
  if(expectedWindow && event.source!==expectedWindow)return {reason:'source_changed'};
  let payload;
  if(typeof event.data==='string') {
    if(event.data.length>16384)return {reason:'payload_too_large'};
    try {payload=JSON.parse(event.data);} catch {return {reason:'invalid_json'};}
  } else if(event.data && typeof event.data==='object' && !Array.isArray(event.data)) payload=event.data;
  else return {reason:'invalid_payload_format'};
  if(payload?.type!=='WA_EMBEDDED_SIGNUP')return {reason:'unrelated_message'};
  if(!['FINISH','FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING','CANCEL','ERROR'].includes(payload.event))return {reason:'unsupported_event'};
  if(payload.event.startsWith('FINISH')) {
    if(typeof payload.data?.waba_id!=='string' || !/^\d{1,40}$/.test(payload.data.waba_id))return {reason:'missing_or_invalid_waba_id'};
    const phoneRequired=payload.event==='FINISH';
    if(phoneRequired && (typeof payload.data.phone_number_id!=='string' || !/^\d{1,40}$/.test(payload.data.phone_number_id)))return {reason:'missing_or_invalid_phone_number_id'};
    if(payload.data.phone_number_id!==undefined && (typeof payload.data.phone_number_id!=='string' || !/^\d{1,40}$/.test(payload.data.phone_number_id)))return {reason:'invalid_phone_number_id'};
  }
  return {parsed:{source:event.source,payload}};
}
export function parseMetaEvent(event, rootWindow, expectedWindow) {
  return inspectMetaEvent(event,rootWindow,expectedWindow).parsed||null;
}
// Invoke synchronously from a user click after SDK and server state are prepared.
export function launchMetaSignup(config, signal) {
  return new Promise((resolve,reject)=>{
    let code,assets,expectedSource,finished=false;
    const cleanup=()=>{clearTimeout(timer);window.removeEventListener('message',listener);signal?.removeEventListener('abort',cancel);};
    const fail=(reason)=>{if(finished)return;finished=true;metaSignupDiagnostic('flow_error',{error:reason});cleanup();reject(Object.assign(new Error(reason),{code:reason}));};
    const finish=()=>{
      const assetsComplete=assets?.waba_id && (assets.signup_mode==='coexistence' || assets.phone_number_id);
      if(!finished && code && assetsComplete){
        metaSignupDiagnostic('code_and_ids_complete',{codePresent:true,wabaIdPresent:true,phoneNumberIdPresent:Boolean(assets.phone_number_id),signupMode:assets.signup_mode});
        finished=true;cleanup();resolve({state:config.state,code,...assets});
      }
    };
    const cancel=()=>fail('signup_cancelled');
    const listener=(event)=>{
      let dataType=null,payloadEvent=null,payloadFormat=typeof event.data;
      if(typeof event.data==='string' && event.data.length<=16384) {
        try {const value=JSON.parse(event.data);dataType=safeType(value?.type);payloadEvent=safeType(value?.event);} catch {/* Only structural diagnostics are recorded. */}
      } else if(event.data && typeof event.data==='object') {dataType=safeType(event.data.type);payloadEvent=safeType(event.data.event);payloadFormat='object';}
      metaSignupDiagnostic('post_message_received',{origin:safeOrigin(event.origin),originAllowed:officialMetaOrigins.has(event.origin),eventType:event.type,dataType,payloadEvent,payloadFormat});
      const inspected=inspectMetaEvent(event,window,expectedSource),parsed=inspected.parsed;
      if(!parsed){if(dataType==='WA_EMBEDDED_SIGNUP')metaSignupDiagnostic('post_message_rejected',{origin:safeOrigin(event.origin),payloadEvent,reason:inspected.reason});return;}
      expectedSource=parsed.source;
      const payload=parsed.payload;
      if(payload.event==='CANCEL') return cancel();
      if(payload.event==='ERROR') return fail('meta_signup_failed');
      const phoneNumberId=payload.data.phone_number_id;
      metaSignupDiagnostic('signup_assets_received',{wabaId:payload.data.waba_id,phoneNumberId:phoneNumberId||null,wabaIdPresent:true,phoneNumberIdPresent:Boolean(phoneNumberId)});
      assets={waba_id:payload.data.waba_id,signup_mode:payload.event==='FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'?'coexistence':'standard'};
      if(phoneNumberId)assets.phone_number_id=phoneNumberId;
      const businessId=payload.data.business_id || payload.data.businessId;
      if(/^\d{1,40}$/.test(businessId || '') && typeof businessId==='string') assets.business_id=businessId;
      finish();
    };
    const timer=setTimeout(()=>fail('signup_timeout'),8*60*1000);
    window.addEventListener('message',listener);
    signal?.addEventListener('abort',cancel,{once:true});
    if(signal?.aborted)return cancel();
    try {
      metaSignupDiagnostic('fb_login_started',{listenerActive:true,statePresent:Boolean(config.state),responseType:'code'});
      window.FB.login((response)=>{
        if(finished)return;
        const returned=response?.authResponse?.code;
        metaSignupDiagnostic('fb_login_callback',{status:safeType(response?.status),authResponsePresent:Boolean(response?.authResponse),codePresent:typeof returned==='string' && returned.length>0});
        if(typeof returned!=='string' || !returned || returned.length>4096) return cancel();
        code=returned; finish();
      },{config_id:config.configId,response_type:'code',override_default_response_type:true,extras:config.extras});
    } catch {fail('sdk_unavailable');}
  });
}
