import { api } from '../../../../lib/platform/api.js';
import { runtimeConfig, signupExtras } from '../../../../lib/platform/config.js';
import { transaction, lockTenant } from '../../../../lib/platform/db.js';
import { HttpError, objectBody } from '../../../../lib/platform/security.js';
import { audit, signupStore } from '../../../../lib/platform/store.js';
import { createSignupAttempt, isWhatsAppSignupMode } from '../../../../lib/meta/embedded-signup.js';
export async function startSignup({ body, context, db }) {
  objectBody(body, ['signupMode']);
  if (!isWhatsAppSignupMode(body.signupMode)) throw new HttpError(400, 'invalid_signup_mode');
  const config = runtimeConfig();
  const state = await transaction(async (tx) => {
    await lockTenant(tx, context.tenantId);
    // A new flow supersedes previous attempts from this session.
    await tx.query("UPDATE signup_attempts SET consumed_at=now(), outcome='cancelled' WHERE session_id=$1 AND consumed_at IS NULL", [context.sessionId]);
    const value = await createSignupAttempt(context, signupStore(tx), body.signupMode);
    await audit(tx, context, 'signup_started');
    return value;
  }, db);
  return { state, signupMode: body.signupMode, appId: config.appId, configId: config.configId, graphVersion: config.graphVersion, extras: signupExtras(config, body.signupMode) };
}
export default api('POST', startSignup, { limit: 5 });
