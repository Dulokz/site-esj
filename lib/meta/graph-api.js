// Server-only module. Never import into src/ or return Graph responses to browsers.
export async function exchangeAuthorizationCode(code, config, fetcher = fetch) {
  if (!config || typeof code !== 'string' || !code || code.length > 4096) throw new Error('invalid_exchange_parameters');
  // Embedded Signup via FB.login exchanges the code without redirect_uri.
  const body = new URLSearchParams({ client_id: config.appId, client_secret: config.appSecret, code });
  let response;
  try {
    response = await fetcher(`https://graph.facebook.com/${config.graphVersion}/oauth/access_token`, {
      method: 'POST', body, signal: AbortSignal.timeout(15000), redirect: 'error',
    });
    const result = await response.json();
    if (!response.ok || result.error || typeof result.access_token !== 'string' || !result.access_token) throw new Error();
    return { accessToken: result.access_token };
  } catch {
    // Deliberately discard upstream errors: they can contain sensitive request data.
    throw new Error('meta_exchange_failed');
  }
}
