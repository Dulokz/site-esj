import { api } from '../../lib/platform/api.js';
export default api('GET', async ({ context }) => ({ user: { email: context.email, role: context.role }, tenant: { name: context.tenantName } }));
