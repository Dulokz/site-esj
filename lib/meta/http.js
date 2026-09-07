export function respond(res, status, data) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

export async function readBody(req) {
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) throw new Error('invalid_content_type');
  if (Number(req.headers['content-length']) > 8192) throw new Error('body_too_large');
  if (req.body !== undefined) {
    if (Buffer.byteLength(typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) > 8192) throw new Error('body_too_large');
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > 8192) throw new Error('body_too_large');
  }
  return JSON.parse(raw);
}
