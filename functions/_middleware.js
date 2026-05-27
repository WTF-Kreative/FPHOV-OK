export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // Allow public assets (login screen layout, images, background style, login API) to bypass the gate
  if (
    url.pathname === '/' || 
    url.pathname === '/index.html' || 
    url.pathname === '/bandit-background.jpg' || 
    url.pathname === '/fphov-logo.png' || 
    url.pathname.startsWith('/api/')
  ) {
    return next();
  }

  // Inspect incoming browser session token headers
  const cookieHeader = request.headers.get('Cookie') || '';
  const hasSession = cookieHeader.includes('fphov_session=authenticated_user');

  // If cookie isn't valid, intercept and force the custom login interface
  if (!hasSession) {
    return context.env.ASSETS.fetch(new URL('/', request.url));
  }

  return next();
}
