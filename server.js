import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { routes } from './lib/routes.js';
import { respond } from './lib/meta/http.js';
import { closeDatabase } from './lib/platform/db.js';

const defaultRoot = fileURLToPath(new URL('./dist/', import.meta.url));
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon', '.woff2':'font/woff2', '.txt':'text/plain; charset=utf-8', '.xml':'application/xml' };

export function createAppServer({ publicDir = defaultRoot } = {}) {
  const root = resolve(publicDir);
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    try {
      let path;
      try { path = decodeURIComponent(new URL(req.url, 'http://local.invalid').pathname); }
      catch { return respond(res, 400, { error:'invalid_path' }); }
      const handler = routes.get(path);
      // Pass the untouched request stream to preserve webhook signatures.
      if (handler) return await handler(req, res);
      if (path === '/api' || path.startsWith('/api/')) return respond(res, 404, { error:'not_found' });
      if (!['GET','HEAD'].includes(req.method)) {
        res.setHeader('Allow', 'GET, HEAD');
        return respond(res, 405, { error:'method_not_allowed' });
      }
      if (path.includes('\\') || path.includes('\0') || path.split('/').some(part => part.startsWith('.'))) return respond(res, 404, { error:'not_found' });
      let target = resolve(root, '.' + path);
      if (target !== root && !target.startsWith(root + sep)) return respond(res, 404, { error:'not_found' });
      let exists = await stat(target).then(info => info.isFile()).catch(() => false);
      if (!exists) {
        if (extname(path) || path.startsWith('/assets/')) return respond(res, 404, { error:'not_found' });
        target = resolve(root, 'index.html');
      }
      const body = await readFile(target);
      res.setHeader('Content-Type', types[extname(target)] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Content-Length', body.length);
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      if (!res.headersSent) respond(res, 500, { error:'request_failed' });
      else res.destroy();
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await stat(resolve(defaultRoot, 'index.html'));
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('invalid_port');
  const server = createAppServer();
  server.requestTimeout = 120000;
  server.listen(port, '0.0.0.0', () => console.log(`ESJ listening on port ${port}`));
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    const timeout = setTimeout(() => process.exit(1), 30000);
    timeout.unref();
    server.close(async () => { await closeDatabase(); clearTimeout(timeout); });
  };
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}
