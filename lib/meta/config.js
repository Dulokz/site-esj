export function getMetaConfig(env = process.env) {
  const names = ['META_APP_ID', 'META_CONFIG_ID', 'META_APP_SECRET', 'META_REDIRECT_URI', 'META_GRAPH_API_VERSION'];
  if (names.some((name) => !env[name])) return null;
  if (!/^\d+$/.test(env.META_APP_ID) || !/^\d+$/.test(env.META_CONFIG_ID) || !/^v\d+\.\d+$/.test(env.META_GRAPH_API_VERSION)) return null;
  try {
    const redirect = new URL(env.META_REDIRECT_URI);
    if (redirect.protocol !== 'https:' || redirect.username || redirect.password || redirect.search || redirect.hash || redirect.pathname !== '/api/meta/whatsapp/callback') return null;
    return { appId: env.META_APP_ID, configId: env.META_CONFIG_ID, appSecret: env.META_APP_SECRET, redirectUri: redirect.href, origin: redirect.origin, graphVersion: env.META_GRAPH_API_VERSION };
  } catch { return null; }
}
