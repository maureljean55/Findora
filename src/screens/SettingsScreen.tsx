import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { User } from '@supabase/supabase-js';
import { colors } from '../theme/colors';
import SectionCard from '../components/SectionCard';
import SettingsRow from '../components/SettingsRow';
import EditableRow from '../components/EditableRow';
import Button from '../components/Button';
import TextField from '../components/TextField';
import { supabase } from '../lib/supabase';
import { t } from '../i18n';

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  distance_unit: 'km' | 'miles';
  notification_prefs: { matches?: boolean; messages?: boolean; marketing?: boolean };
};

type Props = {
  onBack: () => void;
};

export default function SettingsScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    setUser(userData.user ?? null);
    if (!userData.user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', userData.user.id).single();
    setProfile((data as Profile | null) ?? null);
  };

  useEffect(() => {
    load();
  }, []);

  const updateProfile = async (patch: Partial<Profile>) => {
    if (!user) return;
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
    await supabase.from('profiles').update(patch).eq('id', user.id);
  };

  const handleSaveName = async (next: string) => {
    if (!user || !next) return;
    await Promise.all([
      supabase.auth.updateUser({ data: { full_name: next } }),
      supabase.from('profiles').update({ full_name: next }).eq('id', user.id),
    ]);
    setProfile((prev) => (prev ? { ...prev, full_name: next } : prev));
  };

  const handleSaveEmail = async (next: string) => {
    if (!next) return;
    const { error } = await supabase.auth.updateUser({ email: next });
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }
    Alert.alert('Vérification envoyée', 'Confirme le changement depuis le lien reçu par email.');
  };

  const handleSavePhone = async (next: string) => {
    if (!user) return;
    await supabase.from('profiles').update({ phone: next || null }).eq('id', user.id);
    setProfile((prev) => (prev ? { ...prev, phone: next } : prev));
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Mot de passe trop court', 'Il doit contenir au moins 6 caractères.');
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }
    setNewPassword('');
    Alert.alert(t('settings.saved'));
  };

  const handleToggleNotification = (key: 'matches' | 'messages' | 'marketing') => (value: boolean) => {
    const nextPrefs = { ...(profile?.notification_prefs ?? {}), [key]: value };
    updateProfile({ notification_prefs: nextPrefs });
  };

  const handleDeleteAccount = () => {
    Alert.alert(t('settings.dangerZone.deleteAccount'), t('settings.dangerZone.deleteConfirm'), [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () =>
          Alert.alert(
            'Demande envoyée',
            'Contacte support@findora.app pour finaliser la suppression de ton compte.'
          ),
      },
    ]);
  };

  const isGoogleLinked = !!user?.identities?.some((identity) => identity.provider === 'google');
  const isAppleLinked = !!user?.identities?.some((identity) => identity.provider === 'apple');

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 56) }]}>
        <Pressable onPress={onBack} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionCard title={t('settings.account.title')}>
          <EditableRow
            icon="account-outline"
            label={t('settings.account.fullName')}
            value={profile?.full_name ?? ''}
            onSave={handleSaveName}
          />
          <EditableRow
            icon="email-outline"
            label={t('settings.account.email')}
            value={user?.email ?? ''}
            keyboardType="email-address"
            onSave={handleSaveEmail}
          />
          <EditableRow
            icon="phone-outline"
            label={t('settings.account.phone')}
            value={profile?.phone ?? ''}
            placeholder="+33612345678"
            keyboardType="phone-pad"
            onSave={handleSavePhone}
          />

          <View style={styles.passwordRow}>
            <TextField
              label={t('settings.account.changePassword')}
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChangeText={setNewPassword}
              secure
              variant="underline"
              tone="dark"
              icon="lock-outline"
            />
            <Button label={t('settings.save')} onPress={handleChangePassword} loading={passwordSaving} />
          </View>
        </SectionCard>

        <SectionCard title={t('settings.preferences.title')}>
          <SettingsRow icon="translate" label={t('settings.preferences.language')} value="Français" disabled />
          <View style={styles.unitToggle}>
            <Text style={styles.unitLabel}>{t('settings.preferences.distanceUnit')}</Text>
            <View style={styles.unitButtons}>
              <Pressable
                style={[styles.unitButton, profile?.distance_unit !== 'miles' && styles.unitButtonActive]}
                onPress={() => updateProfile({ distance_unit: 'km' })}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    profile?.distance_unit !== 'miles' && styles.unitButtonTextActive,
                  ]}
                >
                  {t('settings.preferences.km')}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.unitButton, profile?.distance_unit === 'miles' && styles.unitButtonActive]}
                onPress={() => updateProfile({ distance_unit: 'miles' })}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    profile?.distance_unit === 'miles' && styles.unitButtonTextActive,
                  ]}
                >
                  {t('settings.preferences.miles')}
                </Text>
              </Pressable>
            </View>
          </View>
        </SectionCard>

        <SectionCard title={t('settings.notifications.title')}>
          <SettingsRow
            icon="target"
            label={t('settings.notifications.matches')}
            toggle={{ value: profile?.notification_prefs?.matches ?? true, onChange: handleToggleNotification('matches') }}
          />
          <SettingsRow
            icon="message-text-outline"
            label={t('settings.notifications.messages')}
            toggle={{ value: profile?.notification_prefs?.messages ?? true, onChange: handleToggleNotification('messages') }}
          />
          <SettingsRow
            icon="bullhorn-outline"
            label={t('settings.notifications.marketing')}
            toggle={{ value: profile?.notification_prefs?.marketing ?? false, onChange: handleToggleNotification('marketing') }}
          />
        </SectionCard>

        <SectionCard title={t('settings.linkedAccounts.title')}>
          <SettingsRow
            icon="google"
            label={t('settings.linkedAccounts.google')}
            value={isGoogleLinked ? t('settings.linkedAccounts.connected') : t('settings.linkedAccounts.notConnected')}
          />
          <SettingsRow
            icon="apple"
            label={t('settings.linkedAccounts.apple')}
            value={isAppleLinked ? t('settings.linkedAccounts.connected') : t('settings.linkedAccounts.notConnected')}
          />
        </SectionCard>

        <SectionCard title={t('settings.dangerZone.title')}>
          <Pressable onPress={handleDeleteAccount}>
            <Text style={styles.deleteText}>{t('settings.dangerZone.deleteAccount')}</Text>
          </Pressable>
        </SectionCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 22,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 16,
  },
  passwordRow: {
    gap: 12,
    marginTop: 4,
  },
  unitToggle: {
    gap: 8,
  },
  unitLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  unitButtons: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: colors.accent,
  },
  unitButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  unitButtonTextActive: {
    color: colors.accentText,
  },
  deleteText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
});
