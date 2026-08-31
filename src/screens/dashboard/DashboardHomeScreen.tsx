import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { User } from '@supabase/supabase-js';
import { colors, splashColors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { t } from '../../i18n';
import type { TabKey } from '../../components/BottomTabBar';
import PromoCarousel, { PromoCard } from '../../components/PromoCarousel';
import DeclarationRow from '../../components/DeclarationRow';
import type { Declaration, DeclarationType } from '../../types/declaration';

type Props = {
  onNavigate: (tab: TabKey) => void;
};

type TypeFilter = 'all' | DeclarationType;

export default function DashboardHomeScreen({ onNavigate }: Props) {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [platformStats, setPlatformStats] = useState<{ total: number; resolved: number } | null>(null);

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const currentUser = userData.user ?? null;
    setUser(currentUser);

    const [{ data: profileData }, { data: declarationsData }, { data: statsData }] = await Promise.all([
      currentUser
        ? supabase.from('profiles').select('avatar_url').eq('id', currentUser.id).single()
        : Promise.resolve({ data: null }),
      supabase
        .from('declarations')
        .select('id, type, category, title, location, reward, status, created_at')
        .order('created_at', { ascending: false }),
      supabase.rpc('platform_stats'),
    ]);
    setAvatarUrl((profileData as { avatar_url: string | null } | null)?.avatar_url ?? null);
    setDeclarations((declarationsData as Declaration[] | null) ?? []);
    const statsRow = (statsData as { total_declarations: number; total_resolved: number }[] | null)?.[0];
    if (statsRow) {
      setPlatformStats({ total: statsRow.total_declarations, resolved: statsRow.total_resolved });
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  const handleContactSupport = () => {
    Share.share({ message: 'support@findora.app' });
  };

  const promoCards: PromoCard[] = [
    {
      key: 'how-it-works',
      icon: 'radar',
      title: t('dashboard.promo.howItWorksTitle'),
      body: t('dashboard.promo.howItWorksBody'),
      colors: [splashColors.gradientTop, splashColors.gradientBottom],
    },
    {
      key: 'anti-fraud',
      icon: 'shield-check-outline',
      title: t('dashboard.promo.antiFraudTitle'),
      body: t('dashboard.promo.antiFraudBody'),
      colors: [splashColors.gradientTop, splashColors.gradientBottom],
    },
    {
      key: 'stats',
      icon: 'chart-line',
      title: t('dashboard.promo.statsTitle'),
      body: platformStats
        ? t('dashboard.promo.statsBody', { total: platformStats.total, resolved: platformStats.resolved })
        : t('dashboard.promo.statsLoading'),
      colors: [splashColors.gradientTop, splashColors.gradientBottom],
    },
  ];

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() || user?.email || '';
  const initial = displayName.charAt(0).toUpperCase();

  const trimmedQuery = query.trim().toLowerCase();
  const filteredDeclarations = declarations
    .filter((item) => typeFilter === 'all' || item.type === typeFilter)
    .filter(
      (item) =>
        !trimmedQuery ||
        [item.title, item.category, item.location].some((field) =>
          field?.toLowerCase().includes(trimmedQuery)
        )
    );

  const FILTER_OPTIONS: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: t('dashboard.filterAll') },
    { key: 'lost', label: t('dashboard.filterLost') },
    { key: 'found', label: t('dashboard.filterFound') },
  ];

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={[styles.headerCard, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.profileRow} onPress={() => onNavigate('profile')}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <LinearGradient
              colors={[splashColors.gradientTop, splashColors.gradientBottom]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initial || '?'}</Text>
            </LinearGradient>
          )}
          <View style={styles.flexShrink}>
            <Text style={styles.greeting}>{t('dashboard.greeting')}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
          </View>
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton} onPress={handleContactSupport}>
            <MaterialCommunityIcons name="headset" size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <MaterialCommunityIcons name="bell-outline" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <PromoCarousel cards={promoCards} />

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.placeholder} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('dashboard.searchPlaceholder')}
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <View>
          <Pressable style={styles.filterButton} onPress={() => setFilterMenuOpen((prev) => !prev)}>
            <MaskedView
              style={styles.filterIconSize}
              maskElement={<MaterialCommunityIcons name="tune-variant" size={20} color="#000000" />}
            >
              <LinearGradient
                colors={[splashColors.gradientTop, splashColors.gradientBottom]}
                style={styles.filterIconSize}
              />
            </MaskedView>
          </Pressable>

          {filterMenuOpen && (
            <View style={styles.filterMenu}>
              {FILTER_OPTIONS.map((option) => (
                <Pressable
                  key={option.key}
                  style={styles.filterMenuItem}
                  onPress={() => {
                    setTypeFilter(option.key);
                    setFilterMenuOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterMenuItemText,
                      typeFilter === option.key && styles.filterMenuItemTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {typeFilter === option.key && (
                    <MaterialCommunityIcons name="check" size={16} color={colors.accent} />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.myDeclarations')}</Text>

        {loading ? (
          <ActivityIndicator style={styles.loading} color={colors.accent} />
        ) : filteredDeclarations.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={32} color={colors.placeholder} />
            <Text style={styles.emptyTitle}>
              {trimmedQuery ? t('dashboard.emptySearchTitle') : t('dashboard.emptyTitle')}
            </Text>
            <Text style={styles.emptyBody}>
              {trimmedQuery ? t('dashboard.emptySearchBody') : t('dashboard.emptyBody')}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredDeclarations.map((item) => (
              <DeclarationRow key={item.id} item={item} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  headerCard: {
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    maxWidth: 180,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    zIndex: 20,
    elevation: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconSize: {
    width: 20,
    height: 20,
  },
  filterMenu: {
    position: 'absolute',
    top: 54,
    right: 0,
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 140,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 10,
    elevation: 10,
  },
  filterMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterMenuItemText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  filterMenuItemTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  loading: {
    marginTop: 32,
  },
  emptyState: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptyBody: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  list: {
    marginTop: 16,
    gap: 12,
  },
});
