// Vendeko — Edge Function : initialise un paiement Moneroo pour passer à un plan payant.
// Déploiement : supabase functions deploy create-payment
// Secrets requis : MONEROO_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MONEROO_SECRET_KEY = Deno.env.get('MONEROO_SECRET_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const ALLOWED_ORIGINS = ['https://app-tunnel-de-vente.vercel.app', 'http://localhost:5173'];
const PLAN_NAMES: Record<string, string> = { createur: 'Pro', entreprise: 'Entreprise' };

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
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'content-type': 'application/json' } });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, cors);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'unauthorized' }, 401, cors);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: 'unauthorized' }, 401, cors);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const planKey = body.planKey;
    if (planKey !== 'createur' && planKey !== 'entreprise') return json({ error: 'invalid_plan' }, 400, cors);

    const { data: profile } = await supabase.from('profiles').select('plan, email, full_name').eq('id', user.id).single();
    if (!profile) return json({ error: 'profile_not_found' }, 404, cors);
    if (profile.plan === planKey) return json({ error: 'already_on_plan' }, 400, cors);

    const { data: priceRow } = await supabase.from('plan_settings').select('price').eq('key', planKey).single();
    const amount = Math.round(Number(priceRow?.price ?? 0));
    if (!amount || amount <= 0) return json({ error: 'invalid_price' }, 400, cors);

    const fullName = (profile.full_name || '').trim();
    const [firstName, ...rest] = fullName ? fullName.split(/\s+/) : ['Client'];
    const lastName = rest.join(' ') || 'Vendeko';

    const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    const monerooRes = await fetch('https://api.moneroo.io/v1/payments/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MONEROO_SECRET_KEY}`,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'XOF',
        description: `Abonnement Vendeko — plan ${PLAN_NAMES[planKey]}`,
        customer: { email: profile.email, first_name: firstName, last_name: lastName },
        return_url: `${allowedOrigin}/app/billing?payment=retour`,
        metadata: { user_id: user.id, plan_key: planKey },
      }),
    });

    if (!monerooRes.ok) {
      const detail = await monerooRes.text();
      return json({ error: 'moneroo_error', detail }, 502, cors);
    }

    const monerooData = await monerooRes.json();
    const paymentId = monerooData?.data?.id;
    const checkoutUrl = monerooData?.data?.checkout_url;
    if (!paymentId || !checkoutUrl) return json({ error: 'moneroo_error', detail: 'missing_checkout_url' }, 502, cors);

    const { error: insertError } = await supabase.from('payments').insert({
      user_id: user.id,
      plan_key: planKey,
      amount,
      currency: 'XOF',
      moneroo_payment_id: paymentId,
      status: 'pending',
    });
    if (insertError) return json({ error: 'server_error', detail: insertError.message }, 500, cors);

    return json({ checkoutUrl }, 200, cors);
  } catch (e) {
    return json({ error: 'server_error', detail: String(e) }, 500, cors);
  }
});
