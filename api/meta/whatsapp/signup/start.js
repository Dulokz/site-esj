import { api } from '../../../../lib/platform/api.js';
import { runtimeConfig } from '../../../../lib/platform/config.js';
import { transaction, lockTenant } from '../../../../lib/platform/db.js';
import { objectBody } from '../../../../lib/platform/security.js';
import { audit, signupStore } from '../../../../lib/platform/store.js';
import { createSignupAttempt } from '../../../../lib/meta/embedded-signup.js';
export default api('POST', async ({ body, context, db }) => {
  objectBody(body, []);
  const config = runtimeConfig();
  const state = await transaction(async (tx) => {
    await lockTenant(tx, context.tenantId);
    // A new flow supersedes previous attempts from this session.
    await tx.query("UPDATE signup_attempts SET consumed_at=now(), outcome='cancelled' WHERE session_id=$1 AND consumed_at IS NULL", [context.sessionId]);
    const value = await createSignupAttempt(context, signupStore(tx));
    await audit(tx, context, 'signup_started');
    return value;
  }, db);
  return { state, appId: config.appId, configId: config.configId, graphVersion: config.graphVersion, extras: config.extras };
}, { limit: 5 });
