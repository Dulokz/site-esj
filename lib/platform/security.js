import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
export const hash = (value) => createHash('sha256').update(value).digest('hex');
export const opaqueToken = () => randomBytes(32).toString('base64url');
export class HttpError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
export function requireOrigin(req) {
  const origin = process.env.APP_ORIGIN;
  if (!origin || new URL(origin).origin !== origin || !origin.startsWith('https://')) throw new HttpError(503, 'configuration_required');
  if (req.headers.origin !== origin) throw new HttpError(403, 'invalid_origin');
}
export function requireAdmin(context) {
  if (!context) throw new HttpError(401, 'authentication_required');
  if (context.role !== 'admin') throw new HttpError(403, 'admin_required');
  return context;
}
export async function passwordHash(password) {
  if (typeof password !== 'string' || password.length < 14 || password.length > 256) throw new Error('password_length');
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt:${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  if (typeof password !== 'string' || password.length > 256) return false;
  const [, salt, expected] = encoded.split(':');
  if (!salt || !expected || !/^[a-f0-9]{128}$/.test(expected)) return false;
  const key = await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return timingSafeEqual(key, Buffer.from(expected, 'hex'));
}
export function objectBody(body, keys) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some((key) => !keys.includes(key))) throw new HttpError(400, 'invalid_parameters');
  return body;
}
export function uuid(value) {
  if (typeof value !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)) throw new HttpError(400, 'invalid_parameters');
  return value;
}
