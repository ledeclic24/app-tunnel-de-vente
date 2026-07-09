import { supabase } from './supabaseClient';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function uploadImage(userId, file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Format non supporté (utilise JPG, PNG, WEBP ou GIF).');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image trop lourde (5 Mo maximum).');
  }
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('funnel-assets').upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('funnel-assets').getPublicUrl(path);
  return data.publicUrl;
}
