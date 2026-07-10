import { supabase } from './supabaseClient';

export async function createPayment(planKey) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error('Non connecté.');

  const { data, error } = await supabase.functions.invoke('create-payment', {
    body: { planKey },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.checkoutUrl;
}

export async function fetchMyPayments(userId) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
