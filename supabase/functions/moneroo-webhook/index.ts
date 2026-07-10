// Vendeko — Edge Function : reçoit les notifications de paiement de Moneroo
// et active le plan payant correspondant une fois le paiement confirmé.
// Déploiement : supabase functions deploy moneroo-webhook --no-verify-jwt
// (--no-verify-jwt est indispensable : Moneroo appelle cette URL directement,
// sans jeton Supabase — la sécurité repose sur la vérification de signature
// ci-dessous, pas sur l'authentification Supabase.)
// Secrets requis : MONEROO_WEBHOOK_SECRET, BREVO_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// URL à renseigner dans Moneroo > Developers > Webhooks :
//   https://<votre-projet>.supabase.co/functions/v1/moneroo-webhook
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MONEROO_WEBHOOK_SECRET = Deno.env.get('MONEROO_WEBHOOK_SECRET')!;
const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const ADMIN_EMAIL = 'jeanpaulden24@gmail.com';
const PLAN_NAMES: Record<string, string> = { createur: 'Pro', entreprise: 'Entreprise' };
const PLAN_DURATION_DAYS = 30;

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
}

async function verifySignature(payload: string, signature: string | null): Promise<boolean> {
  if (!signature) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(MONEROO_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const digestHex = Array.from(new Uint8Array(sigBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  if (digestHex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < digestHex.length; i++) diff |= digestHex.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

async function sendBrevoEmail(to: { email: string; name?: string }, subject: string, htmlContent: string) {
  if (!BREVO_API_KEY) return;
  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Vendeko', email: 'no-reply@vendeko.app' },
        to: [to],
        subject,
        htmlContent,
      }),
    });
  } catch {
    // Un échec d'envoi d'e-mail ne doit jamais bloquer l'activation du plan.
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const rawBody = await req.text();
  const signature = req.headers.get('x-moneroo-signature');
  const valid = await verifySignature(rawBody, signature);
  if (!valid) return json({ error: 'invalid_signature' }, 401);

  let payload: { event?: string; data?: { id?: string; status?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: 'invalid_payload' }, 400);
  }

  const event = payload.event;
  const monerooPaymentId = payload.data?.id;
  if (!monerooPaymentId) return json({ received: true });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: payment } = await supabase.from('payments').select('*').eq('moneroo_payment_id', monerooPaymentId).single();
  if (!payment) return json({ received: true });

  if (event === 'payment.failed' || event === 'payment.cancelled') {
    if (payment.status === 'pending') {
      await supabase.from('payments').update({ status: event === 'payment.failed' ? 'failed' : 'cancelled', updated_at: new Date().toISOString() }).eq('id', payment.id);
    }
    return json({ received: true });
  }

  if (event !== 'payment.success') return json({ received: true });
  if (payment.status === 'success') return json({ received: true }); // déjà traité (idempotence)

  const { data: profile } = await supabase.from('profiles').select('plan, email, full_name').eq('id', payment.user_id).single();
  const oldPlan = profile?.plan || 'starter';
  const expiresAt = new Date(Date.now() + PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await supabase.from('payments').update({ status: 'success', updated_at: new Date().toISOString() }).eq('id', payment.id);
  await supabase.from('profiles').update({ plan: payment.plan_key, plan_expires_at: expiresAt }).eq('id', payment.user_id);
  await supabase.from('plan_change_events').insert({ user_id: payment.user_id, old_plan: oldPlan, new_plan: payment.plan_key });

  const planName = PLAN_NAMES[payment.plan_key] || payment.plan_key;
  if (profile?.email) {
    await sendBrevoEmail(
      { email: profile.email, name: profile.full_name || undefined },
      `Ton plan ${planName} est actif !`,
      `<p>Bonjour${profile.full_name ? ' ' + profile.full_name : ''},</p>
       <p>Ton paiement a bien été reçu et ton plan <strong>${planName}</strong> est actif dès maintenant, jusqu'au ${new Date(expiresAt).toLocaleDateString('fr-FR')}.</p>
       <p>Merci de ta confiance,<br>L'équipe Vendeko</p>`
    );
  }
  await sendBrevoEmail(
    { email: ADMIN_EMAIL },
    `Nouveau paiement — ${planName}`,
    `<p>${profile?.email || payment.user_id} vient de payer le plan ${planName} (${payment.amount} ${payment.currency}).</p>`
  );

  return json({ received: true });
});
