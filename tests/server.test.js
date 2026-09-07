import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { createAppServer } from '../server.js';

test('production HTTP server serves SPA/assets, protects files and preserves API contracts', async () => {
  const savedOrigin = process.env.APP_ORIGIN;
  process.env.APP_ORIGIN = 'https://example.test';
  const root = await mkdtemp(join(tmpdir(), 'esj-server-'));
  await writeFile(join(root, 'index.html'), '<html>ESJ test</html>');
  await mkdir(join(root, 'assets'));
  await writeFile(join(root, 'assets', 'app.js'), 'test asset');
  await writeFile(join(root, '.env.local'), 'must not be served');
  const server = createAppServer({ publicDir:root });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(base + '/integracoes/whatsapp/conectar');
    assert.equal(page.status, 200);
    assert.match(await page.text(), /ESJ test/);
    const asset = await fetch(base + '/assets/app.js');
    assert.match(asset.headers.get('content-type'), /javascript/);
    assert.equal(await asset.text(), 'test asset');
    const head = await fetch(base + '/', { method:'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    for (const path of ['/.env.local', '/%2eenv.local', '/api/unknown', '/assets/missing.js', '/%2e%2e%5cpackage.json']) {
      assert.equal((await fetch(base + path)).status, 404, path);
    }
    assert.equal((await fetch(base + '/%zz')).status, 400);
    const callback = await fetch(base + '/api/meta/whatsapp/callback?code=test');
    assert.equal(callback.status, 405);
    assert.equal(callback.headers.get('allow'), 'POST');
    const original = process.env.META_WEBHOOK_VERIFY_TOKEN;
    process.env.META_WEBHOOK_VERIFY_TOKEN = 'test-only';
    try {
      const webhook = await fetch(base + '/api/meta/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=test-only&hub.challenge=123');
      assert.equal(webhook.status, 200);
      assert.equal(await webhook.text(), '123');
    } finally {
      if (original === undefined) delete process.env.META_WEBHOOK_VERIFY_TOKEN;
      else process.env.META_WEBHOOK_VERIFY_TOKEN = original;
    }
    const rejected = await fetch(base + '/api/meta/whatsapp/callback', { method:'POST', headers:{origin:'https://invalid.test','content-type':'application/json'}, body:'{}' });
    assert.equal(rejected.status, 403);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive:true, force:true });
    if (savedOrigin === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = savedOrigin;
  }
});
