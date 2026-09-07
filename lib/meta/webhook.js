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
      if (change.field !== 'messages') continue;
      const value = change.value;
      const phone = value?.metadata?.phone_number_id;
      if (typeof phone !== 'string' || !/^\d+$/.test(phone)) continue;
      for (const item of [...(Array.isArray(value.messages) ? value.messages.map((item) => ({...item, kind:'message'})) : []), ...(Array.isArray(value.statuses) ? value.statuses.map((item) => ({...item, kind:'status'})) : [])]) {
        if (typeof item.id !== 'string' || item.id.length > 512) continue;
        const status = ['sent','delivered','read','failed'].includes(item.status) ? item.status : null;
        records.push({ wabaId:entry.id,phoneId:phone,kind:item.kind,status,eventHash:hash(JSON.stringify([entry.id,phone,item.kind,item.id,status])) });
      }
    }
  }
  return records;
}
