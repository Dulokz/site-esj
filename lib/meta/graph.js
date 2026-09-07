import { HttpError } from '../platform/security.js';
export class MetaError extends HttpError {
  constructor(code = 'meta_request_failed', status = 502) { super(status, code); }
}
export class GraphAPI {
  constructor(config, fetcher = fetch) { this.config = config; this.fetcher = fetcher; }
  async request(path, token, { method = 'GET', body, fields, form } = {}) {
    const url = new URL(`https://graph.facebook.com/${this.config.graphVersion}/${path}`);
    if (fields) url.searchParams.set('fields', fields);
    let response, result;
    try {
      response = await this.fetcher(url.href, { method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: form || (body ? JSON.stringify(body) : undefined), signal: AbortSignal.timeout(15000), redirect: 'error' });
      result = await response.json();
    } catch { throw new MetaError('meta_unavailable'); }
    if (result.error?.code === 190) throw new MetaError('reauthorization_required', 409);
    if (!response.ok || result.error) throw new MetaError();
    return result;
  }
  async debug(token) {
    // Graph batch wraps a GET inside a POST body so credentials never enter the HTTP URL.
    const batch = [{ method: 'GET', relative_url: `debug_token?input_token=${encodeURIComponent(token)}` }];
    const response = await this.request('', `${this.config.appId}|${this.config.appSecret}`, { method: 'POST', form: new URLSearchParams({ batch: JSON.stringify(batch) }) });
    try {
      const result = JSON.parse(response[0].body);
      if (response[0].code !== 200 || result.error) throw new Error();
      return result.data;
    } catch { throw new MetaError('invalid_token', 409); }
  }
  async list(path, token, fields, maxPages = 10) {
    // Cursor values may be used, but never follow a returned URL containing credentials.
    let result = await this.request(path, token, { fields });
    let rows = result.data;
    if (!Array.isArray(rows)) throw new MetaError();
    let page = 1;
    while (result.paging?.next) {
      const after = result.paging?.cursors?.after;
      if (!after || page++ >= maxPages) throw new MetaError('too_many_assets', 409);
      result = await this.request(`${path}?after=${encodeURIComponent(after)}`, token, { fields });
      if (!Array.isArray(result.data)) throw new MetaError();
      rows = rows.concat(result.data);
    }
    return rows;
  }
  async validate(token, hints) {
    const debug = await this.debug(token);
    const now = Math.floor(Date.now() / 1000);
    if (!debug?.is_valid || String(debug.app_id) !== this.config.appId || (debug.expires_at && debug.expires_at <= now) || (debug.data_access_expires_at && debug.data_access_expires_at <= now)) throw new MetaError('invalid_token', 409);
    for (const scope of ['whatsapp_business_management', 'whatsapp_business_messaging']) {
      if (!debug.scopes?.includes(scope)) throw new MetaError('missing_permissions', 409);
    }
    const allowed = debug.granular_scopes?.find((scope) => scope.scope === 'whatsapp_business_management')?.target_ids;
    if (!Array.isArray(allowed) || !allowed.includes(hints.waba_id)) throw new MetaError('invalid_waba', 409);
    const waba = await this.request(hints.waba_id, token, { fields: 'id,name,owner_business_info' });
    if (waba.id !== hints.waba_id || !/^\d+$/.test(waba.owner_business_info?.id || '')) throw new MetaError('invalid_business', 409);
    if (hints.business_id && hints.business_id !== waba.owner_business_info.id) throw new MetaError('invalid_business', 409);
    const numbers = await this.list(`${waba.id}/phone_numbers`, token, 'id,display_phone_number,verified_name,status');
    const phone = numbers.find((number) => number.id === hints.phone_number_id);
    if (!phone || !phone.display_phone_number) throw new MetaError('invalid_phone_number', 409);
    return { waba, phone, businessId: waba.owner_business_info.id };
  }
  async templates(wabaId, token) {
    return this.list(`${wabaId}/message_templates`, token, 'id,name,status,language,components');
  }
}
