import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { colors, splashColors } from '../../theme/colors';
import Button from '../../components/Button';
import { supabase } from '../../lib/supabase';
import { t } from '../../i18n';

type Props = {
  onSignedOut: () => void;
};

export default function ProfileScreen({ onSignedOut }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
    onSignedOut();
  };

  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() || user?.email || '';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial || '?'}</Text>
      </View>
      <Text style={styles.name}>{displayName}</Text>
      {!!user?.email && user.user_metadata?.full_name && (
        <Text style={styles.email}>{user.email}</Text>
      )}
      {!!user?.phone && <Text style={styles.email}>{user.phone}</Text>}

      <View style={styles.signOutButton}>
        <Button label={t('profile.signOut')} variant="secondary" onPress={handleSignOut} loading={isSigningOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: splashColors.gradientTop,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  email: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  signOutButton: {
    width: '100%',
    maxWidth: 320,
    marginTop: 40,
  },
});
