// TEMPORARY: remove after the next successful production Embedded Signup trace.
export function metaCallbackDiagnostic(stage,details={}) {
  console.info(JSON.stringify({scope:'esj_meta_embedded_signup_callback',temporary:true,at:new Date().toISOString(),stage,...details}));
}

export function safeOrigin(value) {
  if(typeof value!=='string' || value.length>256)return value?'invalid':'missing';
  try {return new URL(value).origin;} catch {return 'invalid';}
}

export function safeErrorCode(error,fallback='request_failed') {
  const value=error?.code;
  return typeof value==='string' && /^[a-z0-9_]{1,64}$/.test(value)?value:fallback;
}

export function callbackPayloadStructure(body) {
  const isObject=Boolean(body) && typeof body==='object' && !Array.isArray(body);
  const known=['state','code','error','business_id','waba_id','phone_number_id','signup_mode'];
  return {
    isObject,
    statePresent:isObject && Object.hasOwn(body,'state'),
    codePresent:isObject && Object.hasOwn(body,'code'),
    errorPresent:isObject && Object.hasOwn(body,'error'),
    wabaIdPresent:isObject && Object.hasOwn(body,'waba_id'),
    phoneNumberIdPresent:isObject && Object.hasOwn(body,'phone_number_id'),
    signupMode:isObject && ['standard','coexistence'].includes(body.signup_mode)?body.signup_mode:null,
    unknownFieldCount:isObject?Object.keys(body).filter((key)=>!known.includes(key)).length:0,
  };
}
