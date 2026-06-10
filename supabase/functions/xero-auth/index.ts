// Redirects the user to Xero's OAuth 2.0 authorisation page.
// Deploy: supabase functions deploy xero-auth
// Secrets required: XERO_CLIENT_ID, XERO_REDIRECT_URI

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const clientId   = Deno.env.get('XERO_CLIENT_ID')
  const redirectUri = Deno.env.get('XERO_REDIRECT_URI')

  if (!clientId || !redirectUri) {
    return new Response('Xero credentials not configured', { status: 500 })
  }

  const state = crypto.randomUUID()

  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     clientId,
    redirect_uri:  redirectUri,
    scope:         'offline_access accounting.transactions accounting.settings',
    state,
  })

  const xeroUrl = `https://login.xero.com/identity/connect/authorize?${params}`
  return Response.redirect(xeroUrl, 302)
})
