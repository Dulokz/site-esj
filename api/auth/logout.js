import { api } from '../../lib/platform/api.js';
import { clearSession } from '../../lib/platform/auth.js';
export default api('POST', async ({ context, db, res }) => {
  await db.query('DELETE FROM sessions WHERE id=$1 AND tenant_id=$2', [context.sessionId, context.tenantId]);
  clearSession(res);
  return { authenticated: false };
});
