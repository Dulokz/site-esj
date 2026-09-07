import { database } from './db.js';
import { authenticate } from './auth.js';
import { requireOrigin, HttpError } from './security.js';
import { rateLimit } from './store.js';
import { respond, readBody } from '../meta/http.js';
export function api(method, fn, { auth = true, limit = 30, getDatabase = database } = {}) {
  return async (req, res) => {
    try {
      if (req.method !== method) { res.setHeader('Allow', method); throw new HttpError(405, 'method_not_allowed'); }
      if (method !== 'GET') requireOrigin(req);
      const db = getDatabase();
      const context = auth ? await authenticate(req, db) : null;
      if (context) await rateLimit(db, `${context.tenantId}:${context.userId}:${req.url?.split('?')[0]}`, limit);
      let body;
      if (method !== 'GET') {
        try { body = await readBody(req); } catch { throw new HttpError(400, 'invalid_parameters'); }
      }
      const result = await fn({ req, res, db, context, body });
      return respond(res, 200, result);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : error.message === 'configuration_required' ? 503 : 500;
      if (status === 429) res.setHeader('Retry-After', '60');
      return respond(res, status, { error: error instanceof HttpError ? error.code : status === 503 ? 'configuration_required' : 'request_failed' });
    }
  };
}
