import { supabase } from './supabase';

/**
 * Uploads a locally picked image (expo-image-picker asset uri) to the
 * `avatars` bucket under the current user's own folder, and returns its
 * public URL. Storage RLS requires the path's first segment to equal
 * auth.uid() (see profile_page.sql).
 */
export async function uploadAvatar(userId: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const extension = localUri.split('.').pop()?.split('?')[0] || 'jpg';
  const path = `${userId}/avatar-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}
