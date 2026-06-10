// Receives the OAuth callback from Xero, exchanges the code for tokens,
// stores them in xero_connections, then redirects back to the Amortix app.
// Deploy: supabase functions deploy xero-callback
// Secrets required: XERO_CLIENT_ID, XERO_CLIENT_SECRET, XERO_REDIRECT_URI, APP_URL

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  const url  = new URL(req.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return new Response('Missing authorisation code', { status: 400 })
  }

  const clientId     = Deno.env.get('XERO_CLIENT_ID')!
  const clientSecret = Deno.env.get('XERO_CLIENT_SECRET')!
  const redirectUri  = Deno.env.get('XERO_REDIRECT_URI')!
  const appUrl       = Deno.env.get('APP_URL') ?? 'https://amortix.io'

  // Exchange auth code for tokens
  const tokenRes = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type:   'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    console.error('Token exchange failed:', err)
    return Response.redirect(`${appUrl}/#/settings/integrations?xero=error`, 302)
  }

  const tokens = await tokenRes.json()

  // Fetch connected Xero organisations for this user
  const connectionsRes = await fetch('https://api.xero.com/connections', {
    headers: { 'Authorization': `Bearer ${tokens.access_token}` },
  })
  const connections: Array<{ tenantId: string; tenantName: string }> = await connectionsRes.json()

  if (!connections.length) {
    return Response.redirect(`${appUrl}/#/settings/integrations?xero=error&reason=no_org`, 302)
  }

  // Use the first connected organisation (multi-org support can be added later)
  const tenant = connections[0]

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  // Store tokens in Supabase using the service role key (bypasses RLS)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { error } = await supabase.from('xero_connections').upsert({
    tenant_id:     tenant.tenantId,
    tenant_name:   tenant.tenantName,
    access_token:  tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at:    expiresAt,
    updated_at:    new Date().toISOString(),
  }, { onConflict: 'tenant_id' })

  if (error) {
    console.error('DB upsert failed:', error)
    return Response.redirect(`${appUrl}/#/settings/integrations?xero=error`, 302)
  }

  return Response.redirect(
    `${appUrl}/#/settings/integrations?xero=connected&tenant=${encodeURIComponent(tenant.tenantName)}`,
    302,
  )
})
