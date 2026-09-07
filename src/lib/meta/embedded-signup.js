let sdkPromise;
export async function apiRequest(path, body, signal) {
  let response;
  try {
    response = await fetch(path, { method: body === undefined ? 'GET':'POST', credentials:'same-origin', cache:'no-store', headers:body === undefined ? {} : {'Content-Type':'application/json'}, body:body === undefined ? undefined : JSON.stringify(body), signal:signal ? AbortSignal.any([signal,AbortSignal.timeout(90000)]) : AbortSignal.timeout(90000) });
  } catch { throw Object.assign(new Error('network_error'), {code:'network_error'}); }
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
export function parseMetaEvent(event, rootWindow, expectedWindow) {
  if(!['https://www.facebook.com','https://web.facebook.com'].includes(event.origin) || !event.source || event.source===rootWindow) return null;
  let popup;
  try {
    popup=event.source.top;
    if(popup.opener!==rootWindow || (expectedWindow && popup!==expectedWindow)) return null;
  } catch {return null;}
  if(typeof event.data!=='string' || event.data.length>16384) return null;
  let payload;
  try {payload=JSON.parse(event.data);} catch {return null;}
  if(payload?.type!=='WA_EMBEDDED_SIGNUP' || !['FINISH','FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING','CANCEL','ERROR'].includes(payload.event)) return null;
  if(payload.event.startsWith('FINISH')) {
    if(!/^\d{1,40}$/.test(payload.data?.waba_id || '') || !/^\d{1,40}$/.test(payload.data?.phone_number_id || '')) return null;
    if(typeof payload.data.waba_id!=='string' || typeof payload.data.phone_number_id!=='string') return null;
  }
  return {popup,payload};
}
// Invoke synchronously from a user click after SDK and server state are prepared.
export function launchMetaSignup(config, signal) {
  return new Promise((resolve,reject)=>{
    let code,assets,expectedWindow,finished=false;
    const cleanup=()=>{clearTimeout(timer);window.removeEventListener('message',listener);signal?.removeEventListener('abort',cancel);};
    const fail=(reason)=>{if(finished)return;finished=true;cleanup();reject(Object.assign(new Error(reason),{code:reason}));};
    const finish=()=>{if(!finished && code && assets){finished=true;cleanup();resolve({state:config.state,code,...assets});}};
    const cancel=()=>fail('signup_cancelled');
    const listener=(event)=>{
      const parsed=parseMetaEvent(event,window,expectedWindow);
      if(!parsed)return;
      expectedWindow=parsed.popup;
      const payload=parsed.payload;
      if(payload.event==='CANCEL') return cancel();
      if(payload.event==='ERROR') return fail('meta_signup_failed');
      assets={waba_id:payload.data.waba_id,phone_number_id:payload.data.phone_number_id,signup_mode:payload.event==='FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'?'coexistence':'standard'};
      if(/^\d{1,40}$/.test(payload.data.business_id || '') && typeof payload.data.business_id==='string') assets.business_id=payload.data.business_id;
      finish();
    };
    const timer=setTimeout(()=>fail('signup_timeout'),8*60*1000);
    window.addEventListener('message',listener);
    signal?.addEventListener('abort',cancel,{once:true});
    if(signal?.aborted)return cancel();
    try {
      window.FB.login((response)=>{
        if(finished)return;
        const returned=response?.authResponse?.code;
        if(typeof returned!=='string' || !returned || returned.length>4096) return cancel();
        code=returned; finish();
      },{config_id:config.configId,response_type:'code',override_default_response_type:true,extras:config.extras});
    } catch {fail('sdk_unavailable');}
  });
}
