export function getMetaConfig(env = process.env) {
  const names = ['META_APP_ID', 'META_CONFIG_ID', 'META_APP_SECRET', 'META_GRAPH_API_VERSION', 'APP_ORIGIN'];
  if (names.some((name) => !env[name])) return null;
  if (!/^\d+$/.test(env.META_APP_ID) || !/^\d+$/.test(env.META_CONFIG_ID) || !/^v\d+\.\d+$/.test(env.META_GRAPH_API_VERSION)) return null;
  try {
    const origin = new URL(env.APP_ORIGIN);
    if (origin.protocol !== 'https:' || origin.origin !== env.APP_ORIGIN) return null;
    return { appId: env.META_APP_ID, configId: env.META_CONFIG_ID, appSecret: env.META_APP_SECRET, origin: origin.origin, graphVersion: env.META_GRAPH_API_VERSION };
  } catch { return null; }
}
