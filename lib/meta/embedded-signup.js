import { randomBytes, createHash } from 'node:crypto';

const hashState = (state) => createHash('sha256').update(state).digest('hex');
const idPattern = /^\d{1,40}$/;
export const whatsappSignupModes = Object.freeze(['cloud_api', 'coexistence']);

export function isWhatsAppSignupMode(value) { return whatsappSignupModes.includes(value); }

export function parseSignupResult(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('invalid_parameters');
  const allowed = ['state', 'code', 'error', 'business_id', 'waba_id', 'phone_number_id', 'signup_mode'];
  if (Object.keys(body).some((key) => !allowed.includes(key))) throw new Error('invalid_parameters');
  if (body.signup_mode !== undefined && !isWhatsAppSignupMode(body.signup_mode)) throw new Error('invalid_parameters');
  if (typeof body.state !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(body.state)) throw new Error('invalid_state');
  if (Object.hasOwn(body, 'code') === Object.hasOwn(body, 'error')) throw new Error('invalid_parameters');
  const field = body.error ? 'error' : 'code';
  // Reject whitespace and control bytes in opaque authorization values.
  // eslint-disable-next-line no-control-regex
  if (typeof body[field] !== 'string' || !body[field] || body[field].length > (field === 'code' ? 4096 : 128) || /[\s\x00-\x1f]/.test(body[field])) throw new Error('invalid_parameters');
  for (const key of ['business_id', 'waba_id', 'phone_number_id']) {
    if (body[key] !== undefined && (typeof body[key] !== 'string' || !idPattern.test(body[key]))) throw new Error('invalid_parameters');
  }
  return body;
}

// Call only after authenticating a user and confirming tenant administration rights.
// Store must be durable and shared across instances; memory/localStorage are unsuitable.
export async function createSignupAttempt(context, store, signupMode = 'cloud_api', now = Date.now()) {
  // Keep the former (context, store, now) internal helper signature compatible.
  if (typeof signupMode === 'number') { now = signupMode; signupMode = 'cloud_api'; }
  if (!context?.tenantId || !context.userId || !context.sessionId) throw new Error('authentication_required');
  if (!isWhatsAppSignupMode(signupMode)) throw new Error('invalid_signup_mode');
  const state = randomBytes(32).toString('base64url');
  await store.insert({ ...context, signupMode, stateHash: hashState(state), expiresAt: now + 10 * 60 * 1000 });
  return state;
}

export async function consumeSignupAttempt(state, context, store, now = Date.now()) {
  if (!context?.tenantId || !context.userId || !context.sessionId || !/^[A-Za-z0-9_-]{43}$/.test(state)) return false;
  return store.consume({ ...context, stateHash: hashState(state), expiresAt: now });
}

export async function consumeSignupAttemptDetailed(state, context, store, now = Date.now()) {
  if (!context?.tenantId || !context.userId || !context.sessionId || !/^[A-Za-z0-9_-]{43}$/.test(state)) return {consumed:false,located:false,expired:false,used:false,contextMatch:false,reason:'invalid_state_format'};
  if(!store.consumeDetailed)return {consumed:await store.consume({...context,stateHash:hashState(state),expiresAt:now}),reason:'unavailable'};
  return store.consumeDetailed({...context,stateHash:hashState(state),expiresAt:now});
}
