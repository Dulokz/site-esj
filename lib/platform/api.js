import { database } from './db.js';
import { authenticate } from './auth.js';
import { requireOrigin, HttpError } from './security.js';
import { rateLimit } from './store.js';
import { respond, readBody } from '../meta/http.js';
import { randomUUID } from 'node:crypto';
import { metaCallbackDiagnostic,safeErrorCode,safeOrigin } from './meta-diagnostics.js';
export function api(method, fn, { auth = true, limit = 30, getDatabase = database, diagnosticScope = null } = {}) {
  return async (req, res) => {
    const diagnosticId=diagnosticScope?randomUUID():null;
    if(diagnosticScope)metaCallbackDiagnostic('request_received',{diagnosticId,method:req.method,origin:safeOrigin(req.headers.origin)});
    try {
      if (req.method !== method) { res.setHeader('Allow', method); throw new HttpError(405, 'method_not_allowed'); }
      if (method !== 'GET') requireOrigin(req);
      const db = getDatabase();
      let context;
      try {context = auth ? await authenticate(req, db) : null;}
      catch(error){if(diagnosticScope)metaCallbackDiagnostic('session_checked',{diagnosticId,valid:false,reason:safeErrorCode(error)});throw error;}
      if(diagnosticScope)metaCallbackDiagnostic('session_checked',{diagnosticId,valid:Boolean(context)});
      if (context) await rateLimit(db, `${context.tenantId}:${context.userId}:${req.url?.split('?')[0]}`, limit);
      let body;
      if (method !== 'GET') {
        try { body = await readBody(req); } catch { throw new HttpError(400, 'invalid_parameters'); }
      }
      const result = await fn({ req, res, db, context, body });
      if(diagnosticScope)metaCallbackDiagnostic('request_completed',{diagnosticId,status:200});
      return respond(res, 200, result);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : error.message === 'configuration_required' ? 503 : 500;
      if(diagnosticScope)metaCallbackDiagnostic('request_failed',{diagnosticId,status,reason:safeErrorCode(error,status===503?'configuration_required':'request_failed')});
      if (status === 429) res.setHeader('Retry-After', '60');
      return respond(res, status, { error: error instanceof HttpError ? error.code : status === 503 ? 'configuration_required' : 'request_failed' });
    }
  };
}
