// Vendeko — Edge Function : suppression définitive du compte de l'utilisateur connecté.
// Déploiement : supabase functions deploy delete-account
// Secrets requis : ceux déjà présents pour generate-tunnel (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const ALLOWED_ORIGINS = ['https://app-tunnel-de-vente.vercel.app', 'http://localhost:5173'];

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function json(obj: unknown, status = 200, cors: Record<string, string> = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, 'content-type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req.headers.get('origin'));
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, cors);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'unauthorized' }, 401, cors);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: 'unauthorized' }, 401, cors);

    await supabase.from('audit_log').insert({
      actor_id: userData.user.id,
      action: 'account.delete',
      target: userData.user.email,
      meta: { self_service: true },
    });

    const { error: deleteErr } = await supabase.auth.admin.deleteUser(userData.user.id);
    if (deleteErr) return json({ error: 'delete_failed', detail: deleteErr.message }, 500, cors);

    return json({ success: true }, 200, cors);
  } catch (e) {
    return json({ error: 'server_error', detail: String(e) }, 500, cors);
  }
});
