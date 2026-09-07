import { getMetaConfig } from '../meta/config.js';
import { encryptionKey } from './credentials.js';
import { HttpError } from './security.js';
export function runtimeConfig() {
  const meta = getMetaConfig();
  if (!meta || meta.origin !== process.env.APP_ORIGIN || !process.env.DATABASE_URL || !process.env.META_WEBHOOK_VERIFY_TOKEN) throw new HttpError(503, 'configuration_required');
  encryptionKey();
  let extras;
  try { extras = JSON.parse(process.env.META_EMBEDDED_SIGNUP_EXTRAS || ''); }
  catch { throw new HttpError(503, 'configuration_required'); }
  const keys = ['feature', 'featureType', 'version', 'sessionInfoVersion','setup'];
  if (!extras || typeof extras !== 'object' || Array.isArray(extras) || !Object.keys(extras).length || Object.entries(extras).some(([key, value]) => {
    if(!keys.includes(key))return true;
    if(key==='setup')return !value || typeof value!=='object' || Array.isArray(value) || Object.keys(value).length>0;
    if(key==='sessionInfoVersion' && Number.isInteger(value))return value<1 || value>10;
    return typeof value!=='string' || value.length>100;
  })) throw new HttpError(503, 'configuration_required');
  return { ...meta, extras };
}
