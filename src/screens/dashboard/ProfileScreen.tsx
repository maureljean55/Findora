import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { User } from '@supabase/supabase-js';
import { colors, splashColors } from '../../theme/colors';
import SectionCard from '../../components/SectionCard';
import SettingsRow from '../../components/SettingsRow';
import Button from '../../components/Button';
import { supabase } from '../../lib/supabase';
import { uploadAvatar } from '../../lib/uploadAvatar';
import { exportUserData } from '../../lib/exportUserData';
import { getBadgeLevel } from '../../lib/badgeLevel';
import { t } from '../../i18n';
import type { TabKey } from '../../components/BottomTabBar';

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  is_public: boolean;
  identity_verified: boolean;
  referral_code: string | null;
  created_at: string;
};

type Stats = {
  lost: number;
  found: number;
  returned: number;
  rewardsGiven: number;
  rewardsReceived: number;
  favorites: number;
};

const EMPTY_STATS: Stats = {
  lost: 0,
  found: 0,
  returned: 0,
  rewardsGiven: 0,
  rewardsReceived: 0,
  favorites: 0,
};

type Props = {
  onNavigate: (tab: TabKey) => void;
  onOpenSettings: () => void;
  onSignedOut: () => void;
};

export default function ProfileScreen({ onNavigate, onOpenSettings, onSignedOut }: Props) {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [visibilityUpdating, setVisibilityUpdating] = useState(false);

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const currentUser = userData.user ?? null;
    setUser(currentUser);
    if (!currentUser) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const [{ data: profileData }, { data: declarations }, { data: reviews }, { count: favoritesCount }] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', currentUser.id).single(),
        supabase.from('declarations').select('type, status, reward').eq('user_id', currentUser.id),
        supabase.from('reviews').select('rating').eq('reviewee_id', currentUser.id),
        supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.id),
      ]);

    setProfile((profileData as Profile | null) ?? null);

    const rows = declarations ?? [];
    const lost = rows.filter((row) => row.type === 'lost').length;
    const found = rows.filter((row) => row.type === 'found').length;
    const returned = rows.filter((row) => row.type === 'found' && row.status === 'resolved').length;
    const rewardsGiven = rows.filter(
      (row) => row.type === 'lost' && row.status === 'resolved' && !!row.reward
    ).length;
    const rewardsReceived = rows.filter(
      (row) => row.type === 'found' && row.status === 'resolved' && !!row.reward
    ).length;

    setStats({
      lost,
      found,
      returned,
      rewardsGiven,
      rewardsReceived,
      favorites: favoritesCount ?? 0,
    });

    const ratings = (reviews ?? []).map((review) => review.rating as number);
    setReviewCount(ratings.length);
    setAverageRating(ratings.length ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : null);

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleChangePhoto = async () => {
    if (!user) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', "Autorise l'accès à tes photos pour changer ta photo de profil.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploadingPhoto(true);
    try {
      const publicUrl = await uploadAvatar(user.id, result.assets[0].uri);
      const { error } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      if (error) throw error;
      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : prev));
    } catch (err) {
      Alert.alert('Erreur', "Impossible de mettre à jour la photo de profil pour l'instant.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleToggleVisibility = async (next: boolean) => {
    if (!user) return;
    setVisibilityUpdating(true);
    setProfile((prev) => (prev ? { ...prev, is_public: next } : prev));
    const { error } = await supabase.from('profiles').update({ is_public: next }).eq('id', user.id);
    setVisibilityUpdating(false);
    if (error) {
      setProfile((prev) => (prev ? { ...prev, is_public: !next } : prev));
    }
  };

  const handleCopyReferralCode = async () => {
    if (!profile?.referral_code) return;
    await Clipboard.setStringAsync(profile.referral_code);
    Alert.alert(t('profile.social.codeCopied'));
  };

  const handleShareApp = async () => {
    await Share.share({ message: 'Rejoins-moi sur Findora, l\'application qui aide à retrouver les objets perdus !' });
  };

  const handleShareProfile = async () => {
    if (!profile?.referral_code) return;
    await Share.share({
      message: `Découvre mon profil Findora — code de parrainage : ${profile.referral_code}`,
    });
  };

  const handleExportData = async () => {
    if (!user) return;
    try {
      await exportUserData(user.id);
    } catch {
      Alert.alert('Erreur', "Impossible d'exporter les données pour l'instant.");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignedOut();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const displayName = profile?.full_name?.trim() || (user?.user_metadata?.full_name as string) || user?.email || '';
  const initial = displayName.charAt(0).toUpperCase();
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : '';
  const location = [profile?.city, profile?.country].filter(Boolean).join(', ');
  const badge = getBadgeLevel(stats.returned);
  const remainingToNext = badge.next ? badge.next.threshold - stats.returned : 0;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top + 8, 24) }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* 1. Identité */}
      <View style={styles.header}>
        <Pressable style={styles.avatarWrap} onPress={handleChangePhoto} disabled={uploadingPhoto}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
          ) : (
            <LinearGradient
              colors={[splashColors.gradientTop, splashColors.gradientBottom]}
              style={styles.avatarFallback}
            >
              <Text style={styles.avatarFallbackText}>{initial || '?'}</Text>
            </LinearGradient>
          )}
          <View style={styles.avatarEditBadge}>
            {uploadingPhoto ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="camera-outline" size={14} color="#FFFFFF" />
            )}
          </View>
        </Pressable>

        <Text style={styles.name}>{displayName}</Text>

        <View style={styles.identifierRow}>
          {!!user?.email && (
            <View style={styles.identifierChip}>
              <Text style={styles.identifierText}>{user.email}</Text>
              {!!user.email_confirmed_at && (
                <MaterialCommunityIcons name="check-decagram" size={14} color={colors.accent} />
              )}
            </View>
          )}
          {!!user?.phone && (
            <View style={styles.identifierChip}>
              <Text style={styles.identifierText}>{user.phone}</Text>
              {!!user.phone_confirmed_at && (
                <MaterialCommunityIcons name="check-decagram" size={14} color={colors.accent} />
              )}
            </View>
          )}
        </View>

        {!!joinDate && (
          <Text style={styles.metaText}>{t('profile.memberSince', { date: joinDate })}</Text>
        )}
        <Text style={styles.metaText}>{location || t('profile.noLocation')}</Text>
      </View>

      {/* 2. Badge / niveau de confiance */}
      <SectionCard title={t('profile.badge.title')}>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeEmoji}>{badge.current.emoji}</Text>
          <View style={styles.flexShrink}>
            <Text style={styles.badgeName}>{t(`profile.badge.${badge.current.key}`)}</Text>
            <Text style={styles.badgeProgress}>
              {badge.next
                ? t('profile.badge.progress', {
                    count: stats.returned,
                    remaining: remainingToNext,
                    next: t(`profile.badge.${badge.next.key}`),
                  })
                : t('profile.badge.maxLevel')}
            </Text>
          </View>
        </View>
      </SectionCard>

      {/* 3. Statistiques personnelles */}
      <SectionCard title={t('profile.stats.title')}>
        <View style={styles.statsRow}>
          <StatTile value={stats.lost} label={t('profile.stats.lost')} />
          <StatTile value={stats.found} label={t('profile.stats.found')} />
          <StatTile value={stats.returned} label={t('profile.stats.returned')} />
        </View>
      </SectionCard>

      {/* 4. Confiance & réputation */}
      <SectionCard title={t('profile.trust.title')}>
        <SettingsRow
          icon={profile?.identity_verified ? 'shield-check' : 'shield-outline'}
          label={
            profile?.identity_verified
              ? t('profile.trust.identityVerified')
              : t('profile.trust.identityNotVerified')
          }
          value={profile?.identity_verified ? undefined : t('profile.trust.verifyAction')}
          onPress={
            profile?.identity_verified
              ? undefined
              : () => Alert.alert(t('comingSoon.title'), t('comingSoon.body'))
          }
        />
        <SettingsRow
          icon="star-outline"
          label={t('profile.trust.averageRating')}
          value={
            averageRating != null
              ? `${averageRating.toFixed(1)} ★ (${t('profile.trust.reviewsCount', { count: reviewCount })})`
              : t('profile.trust.noReviews')
          }
        />
        <SettingsRow
          icon="clock-fast"
          label={t('profile.trust.responseRate')}
          value={t('profile.trust.responseRateUnavailable')}
          disabled
        />
      </SectionCard>

      {/* 5. Mes déclarations */}
      <SectionCard title={t('profile.declarations.title')}>
        <SettingsRow icon="map-marker-alert-outline" label={t('profile.declarations.myLost')} onPress={() => onNavigate('home')} />
        <SettingsRow icon="hand-heart-outline" label={t('profile.declarations.myFound')} onPress={() => onNavigate('home')} />
        <SettingsRow icon="archive-outline" label={t('profile.declarations.history')} onPress={() => onNavigate('history')} />
        <SettingsRow
          icon="heart-outline"
          label={t('profile.declarations.favorites')}
          value={stats.favorites > 0 ? String(stats.favorites) : t('profile.declarations.favoritesEmpty')}
        />
      </SectionCard>

      {/* 6. Historique financier */}
      <SectionCard title={t('profile.finance.title')}>
        {stats.rewardsGiven === 0 && stats.rewardsReceived === 0 ? (
          <Text style={styles.emptyText}>{t('profile.finance.empty')}</Text>
        ) : (
          <View style={styles.statsRow}>
            <StatTile value={stats.rewardsGiven} label={t('profile.finance.given')} />
            <StatTile value={stats.rewardsReceived} label={t('profile.finance.received')} />
          </View>
        )}
      </SectionCard>

      {/* 7. Social & engagement */}
      <SectionCard title={t('profile.social.title')}>
        <Text style={styles.cardSubtitle}>{t('profile.social.referralBody')}</Text>
        <Pressable style={styles.referralCodeBox} onPress={handleCopyReferralCode}>
          <Text style={styles.referralCode}>{profile?.referral_code ?? '—'}</Text>
          <MaterialCommunityIcons name="content-copy" size={16} color={colors.accent} />
        </Pressable>
        <SettingsRow icon="account-plus-outline" label={t('profile.social.shareProfile')} onPress={handleShareProfile} />
        <SettingsRow icon="share-variant-outline" label={t('profile.social.shareApp')} onPress={handleShareApp} />
      </SectionCard>

      {/* 8. Confidentialité & données */}
      <SectionCard title={t('profile.privacy.title')}>
        <SettingsRow icon="download-outline" label={t('profile.privacy.exportData')} onPress={handleExportData} />
        <SettingsRow
          icon="eye-outline"
          label={t('profile.privacy.visibility')}
          toggle={{ value: profile?.is_public ?? true, onChange: handleToggleVisibility }}
          disabled={visibilityUpdating}
        />
        <SettingsRow
          icon="cellphone-link"
          label={t('profile.privacy.loginHistory')}
          onPress={() => Alert.alert(t('comingSoon.title'), t('comingSoon.body'))}
        />
      </SectionCard>

      {/* 9. Support & confiance */}
      <SectionCard title={t('profile.support.title')}>
        <SettingsRow icon="help-circle-outline" label={t('profile.support.help')} onPress={() => Alert.alert(t('comingSoon.title'), t('comingSoon.body'))} />
        <SettingsRow icon="email-outline" label={t('profile.support.contact')} onPress={() => Share.share({ message: 'support@findora.app' })} />
        <SettingsRow icon="alert-circle-outline" label={t('profile.support.report')} onPress={() => Alert.alert(t('comingSoon.title'), t('comingSoon.body'))} />
        <SettingsRow icon="file-document-outline" label={t('profile.support.terms')} onPress={() => Alert.alert(t('comingSoon.title'), t('comingSoon.body'))} />
        <SettingsRow icon="shield-lock-outline" label={t('profile.support.privacyPolicy')} onPress={() => Alert.alert(t('comingSoon.title'), t('comingSoon.body'))} />
      </SectionCard>

      {/* 10. Autres */}
      <SectionCard title={t('profile.other.title')}>
        <SettingsRow
          icon="bell-outline"
          label={t('profile.other.notifications')}
          value={t('profile.other.notificationsEmpty')}
          disabled
        />
        <SettingsRow icon="information-outline" label={t('profile.other.version', { version: '1.0.0' })} />
        <SettingsRow icon="star-outline" label={t('profile.other.rateApp')} onPress={() => Alert.alert(t('comingSoon.title'), t('comingSoon.body'))} />
      </SectionCard>

      {/* 11. Paramètres */}
      <View style={styles.settingsButton}>
        <Button label={t('profile.settings')} variant="secondary" onPress={onOpenSettings} />
      </View>

      <View style={styles.signOutButton}>
        <Button label={t('profile.signOut')} variant="secondary" onPress={handleSignOut} />
      </View>
    </ScrollView>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    marginBottom: 8,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  identifierRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  identifierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  identifierText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaText: {
    fontSize: 12,
    color: colors.placeholder,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flexShrink: {
    flexShrink: 1,
  },
  badgeEmoji: {
    fontSize: 36,
  },
  badgeName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badgeProgress: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: -4,
  },
  referralCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  referralCode: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  settingsButton: {
    marginTop: 8,
  },
  signOutButton: {
    marginTop: 4,
  },
});
