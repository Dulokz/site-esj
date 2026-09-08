import { createHmac, timingSafeEqual } from 'node:crypto';
import { HttpError, hash } from '../platform/security.js';
export function verifySignature(raw, signature, secret) {
  if (!secret || typeof signature !== 'string' || !/^sha256=[a-f0-9]{64}$/.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(raw).digest();
  return timingSafeEqual(expected, Buffer.from(signature.slice(7), 'hex'));
}
export async function rawBody(req) {
  const max = 1024 * 1024;
  if (Number(req.headers['content-length']) > max) throw new HttpError(413, 'body_too_large');
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    const value = Buffer.from(chunk); size += value.length;
    if (size > max) throw new HttpError(413,'body_too_large');
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export function webhookRecords(body) {
  if (body?.object !== 'whatsapp_business_account' || !Array.isArray(body.entry) || body.entry.length > 100) throw new HttpError(400,'invalid_webhook');
  const records = [];
  for (const entry of body.entry) {
    if (typeof entry.id !== 'string' || !/^\d+$/.test(entry.id) || !Array.isArray(entry.changes)) throw new HttpError(400,'invalid_webhook');
    for (const change of entry.changes) {
      const value = change.value;
      const phone = value?.metadata?.phone_number_id;
      const validPhone = typeof phone === 'string' && /^\d+$/.test(phone) ? phone : null;
      if (change.field === 'messages' && validPhone) {
        for (const item of [...(Array.isArray(value.messages) ? value.messages.map((item) => ({...item, kind:'message'})) : []), ...(Array.isArray(value.statuses) ? value.statuses.map((item) => ({...item, kind:'status'})) : [])]) {
          if (typeof item.id !== 'string' || item.id.length > 512) continue;
          const status = ['sent','delivered','read','failed'].includes(item.status) ? item.status : null;
          records.push({ wabaId:entry.id,phoneId:validPhone,kind:item.kind,status,eventHash:hash(JSON.stringify([entry.id,validPhone,item.kind,item.id,status])) });
        }
      } else if (change.field === 'smb_message_echoes' && validPhone) {
        const echoes = Array.isArray(value.smb_message_echoes) ? value.smb_message_echoes : [];
        for (const item of echoes) {
          if (typeof item?.id !== 'string' || item.id.length > 512) continue;
          records.push({ wabaId:entry.id,phoneId:validPhone,kind:'smb_message_echo',status:null,eventHash:hash(JSON.stringify([entry.id,validPhone,'smb_message_echo',item.id])) });
        }
      } else if (['history','smb_app_state_sync'].includes(change.field)) {
        // Recognized for audit/diagnostics only. Their payload is deliberately not retained.
        records.push({ wabaId:entry.id,phoneId:validPhone,kind:change.field,status:null,eventHash:hash(JSON.stringify([entry.id,validPhone,change.field,JSON.stringify(value || {}).slice(0, 1024)])) });
      } else if (change.field === 'account_update') {
        const action = typeof value?.event === 'string' && /^[A-Z_]{1,64}$/.test(value.event) ? value.event : null;
        records.push({ wabaId:entry.id,phoneId:validPhone,kind:'account_update',status:action,eventHash:hash(JSON.stringify([entry.id,validPhone,'account_update',action,JSON.stringify(value || {}).slice(0, 1024)])) });
      }
    }
  }
  return records;
}
