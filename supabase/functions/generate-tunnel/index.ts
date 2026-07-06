// Vendeko — Edge Function: génère un tunnel de vente complet via Claude.
// Déploiement : supabase functions deploy generate-tunnel
// Secrets requis : ANTHROPIC_API_KEY (supabase secrets set ANTHROPIC_API_KEY=...)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}

const BLOCK_SCHEMA = `
Chaque bloc a un "type" et un "content" strictement conforme à l'un de ces formats :

- hero: { eyebrow, heading, subheading, imageUrl, ctaText, externalUrl: "" }
- text: { heading, body }
- image: { url, caption }
- form: { headline, buttonText, successMessage }
- cta: { heading, buttonText, externalUrl: "" }
- features: { heading, items: [{ title, description }] } (2 à 4 items)
- testimonials: { heading, items: [{ name, role, quote }] } (1 à 3 items)
- pricing: { heading, plans: [{ name, price, period, features: [string], highlight: boolean }] }
- countdown: { headline, targetDate: "YYYY-MM-DDTHH:mm" (une date future) }
- faq: { heading, items: [{ question, answer }] } (2 à 5 items)
- quiz: { heading, questions: [{ question, options: [string] }] (2 à 4 questions, 2 à 4 options chacune), resultButtonText }

Les blocs "features", "testimonials", "pricing", "countdown", "faq" et "quiz" sont réservés aux plans payants : ne les utilise que si le plan de l'utilisateur les autorise (indiqué plus bas).
`;

function buildPrompt({ description, category, images, price, paletteHint, allowedBlocks }: {
  description: string; category: string; images: string[]; price: string; paletteHint: string; allowedBlocks: string[];
}) {
  return `Tu es le moteur de génération de tunnels de vente de Vendeko, un outil pensé pour des débutants qui n'ont jamais vendu en ligne.

À partir de la description ci-dessous, génère un tunnel de vente complet (1 à 3 pages/étapes, chacune avec 2 à 6 blocs) en français, avec un ton chaleureux et concret.

Description de l'offre fournie par l'utilisateur :
"""
${description}
"""

Catégorie de tunnel souhaitée : ${category || "choisis la plus pertinente toi-même"}

Prix de l'offre : ${price ? `"${price}" — utilise EXACTEMENT ce prix partout où un prix est affiché (bloc pricing, texte, CTA). N'invente aucun autre prix.` : "aucun prix fourni, choisis un prix cohérent avec l'offre décrite si besoin"}

Types de blocs autorisés pour ce plan : ${allowedBlocks.join(', ')}
${BLOCK_SCHEMA}

Images fournies par l'utilisateur, à réutiliser telles quelles (dans l'ordre le plus pertinent) pour les champs imageUrl/url des blocs hero/image. N'invente JAMAIS d'autre URL d'image. S'il n'y a aucune image fournie, utilise cette image par défaut pour tout bloc hero/image : "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1600&auto=format&fit=crop".
Images fournies : ${images.length > 0 ? JSON.stringify(images) : 'aucune'}

Palette de couleurs : ${paletteHint || "choisis une palette cohérente à deux couleurs (une couleur principale sombre, une couleur d'accent vive) adaptée au ton de l'offre"}.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, au format exact suivant :
{
  "steps": [
    { "name": "string", "slug": "string-en-minuscules-avec-tirets", "step_type": "opt-in|sales|order|thankyou|booking|quiz|custom", "blocks": [ { "type": "...", "content": { ... } } ] }
  ],
  "brand": { "primaryColor": "#hex", "accentColor": "#hex" }
}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'unauthorized' }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: 'unauthorized' }, 401);
    const user = userData.user;

    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
    const plan = profile?.plan || 'starter';
    if (plan === 'starter') return json({ error: 'plan_required' }, 403);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from('ai_generations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    const limit = plan === 'entreprise' ? Infinity : 20;
    if ((count || 0) >= limit) return json({ error: 'limit_reached' }, 429);

    const body = await req.json();
    const description: string = (body.description || '').trim();
    const category: string = body.category || '';
    const images: string[] = Array.isArray(body.images) ? body.images.slice(0, 5) : [];
    const price: string = (body.price || '').trim();
    const paletteHint: string = body.paletteHint || '';

    if (description.length < 5) return json({ error: 'invalid_input' }, 400);

    const allowedBlocks = plan === 'entreprise' || plan === 'createur'
      ? ['hero', 'text', 'image', 'form', 'cta', 'features', 'testimonials', 'pricing', 'countdown', 'faq', 'quiz']
      : ['hero', 'text', 'image', 'form', 'cta'];

    const prompt = buildPrompt({ description, category, images, price, paletteHint, allowedBlocks });

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return json({ error: 'ai_error', detail: errText }, 502);
    }

    const aiData = await aiRes.json();
    const textBlock = (aiData.content || []).find((block: { type: string }) => block.type === 'text');
    const text = textBlock?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return json({ error: 'parse_error' }, 502);

    let funnel;
    try {
      funnel = JSON.parse(jsonMatch[0]);
    } catch {
      return json({ error: 'parse_error' }, 502);
    }

    await supabase.from('ai_generations').insert({ user_id: user.id });

    return json({ funnel });
  } catch (e) {
    return json({ error: 'server_error', detail: String(e) }, 500);
  }
});
