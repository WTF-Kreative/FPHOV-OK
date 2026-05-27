export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { user, pass } = await request.json();

    if (!user || !pass) {
      return new Response(JSON.stringify({ error: 'Missing credentials' }), { status: 400 });
    }

    const normalizedUser = user.toLowerCase().trim();

    // 🔐 FETCH DIRECTLY FROM CLOUDFLARE KV (Nothing is on GitHub)
    const userDataStr = await env.FPHOV_AUTH.get(normalizedUser);
    
    // If the username doesn't exist in your Cloudflare KV entries, deny instantly
    if (!userDataStr) {
      return new Response(JSON.stringify({ error: 'Access Denied' }), { status: 401 });
    }

    const userData = JSON.parse(userDataStr);

    // Verify the password and make sure the active flag is true inside Cloudflare KV
    if (userData.password === pass && userData.active === true) {
      console.log(`[AUDIT LOG] Secure login verified for: ${normalizedUser}`);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': 'fphov_session=authenticated_user; Path=/; HttpOnly; SameSite=Strict; Secure'
        }
      });
    }

    return new Response(JSON.stringify({ error: 'Access Denied' }), { status: 401 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
