import { Platform, Share } from 'react-native';
import { supabase } from './supabase';

/**
 * RGPD-style export: bundles everything the user themselves can read under
 * RLS (profile, declarations, reviews written/received) into one JSON file,
 * then hands it to the user — download on web, native share sheet on
 * iOS/Android. No server-side job involved.
 */
export async function exportUserData(userId: string) {
  const [{ data: profile }, { data: declarations }, { data: reviewsReceived }, { data: reviewsWritten }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('declarations').select('*').eq('user_id', userId),
      supabase.from('reviews').select('*').eq('reviewee_id', userId),
      supabase.from('reviews').select('*').eq('reviewer_id', userId),
    ]);

  const payload = {
    exported_at: new Date().toISOString(),
    profile,
    declarations,
    reviews_received: reviewsReceived,
    reviews_written: reviewsWritten,
  };

  const json = JSON.stringify(payload, null, 2);

  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'findora-mes-donnees.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  await Share.share({ message: json, title: 'Mes données Findora' });
}
