import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * À l'inscription, le téléphone est stocké dans user_metadata.pending_phone.
 * On l'enregistre ici dans la table profiles (téléphone -> email), qui sert
 * de base à la connexion par téléphone — voir email_for_phone() côté
 * Supabase. Pas de vérification SMS : le numéro est simplement celui saisi
 * à l'inscription.
 */
export async function linkPendingPhone(user: User | null | undefined) {
  const pendingPhone = user?.user_metadata?.pending_phone;
  if (!pendingPhone) return;

  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert({ id: user!.id, phone: pendingPhone });
  if (upsertError) {
    console.warn('[linkPendingPhone] échec de la liaison du téléphone', upsertError.message);
    return;
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: { pending_phone: null },
  });
  if (updateError) {
    console.warn('[linkPendingPhone] échec du nettoyage des métadonnées', updateError.message);
  }
}
