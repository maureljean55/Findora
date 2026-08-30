import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { User } from '@supabase/supabase-js';
import { colors, splashColors, statusColors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { t } from '../../i18n';
import type { TabKey } from '../../components/BottomTabBar';

type DeclarationType = 'lost' | 'found';
type DeclarationStatus = 'pending' | 'matched' | 'resolved' | 'archived';

type Declaration = {
  id: string;
  type: DeclarationType;
  category: string;
  title: string;
  location: string | null;
  reward: string | null;
  status: DeclarationStatus;
  created_at: string;
};

type Filter = 'all' | DeclarationType;

type Props = {
  onNavigate: (tab: TabKey) => void;
};

export default function DashboardHomeScreen({ onNavigate }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const currentUser = userData.user ?? null;
    setUser(currentUser);

    const [{ data: profileData }, { data: declarationsData }] = await Promise.all([
      currentUser
        ? supabase.from('profiles').select('avatar_url').eq('id', currentUser.id).single()
        : Promise.resolve({ data: null }),
      supabase
        .from('declarations')
        .select('id, type, category, title, location, reward, status, created_at')
        .order('created_at', { ascending: false }),
    ]);
    setAvatarUrl((profileData as { avatar_url: string | null } | null)?.avatar_url ?? null);
    setDeclarations((declarationsData as Declaration[] | null) ?? []);
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

  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() || user?.email || '';
  const initial = displayName.charAt(0).toUpperCase();

  const filteredDeclarations = declarations.filter(
    (item) => filter === 'all' || item.type === filter
  );

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.headerCard}>
        <Pressable onPress={() => onNavigate('profile')}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial || '?'}</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.bellButton}>
          <MaterialCommunityIcons name="bell-outline" size={20} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.myDeclarations')}</Text>

        <View style={styles.filterRow}>
          <FilterPill label={t('dashboard.filterAll')} active={filter === 'all'} onPress={() => setFilter('all')} />
          <FilterPill
            label={t('dashboard.filterLost')}
            active={filter === 'lost'}
            onPress={() => setFilter('lost')}
          />
          <FilterPill
            label={t('dashboard.filterFound')}
            active={filter === 'found'}
            onPress={() => setFilter('found')}
          />
        </View>

        {loading ? (
          <ActivityIndicator style={styles.loading} color={colors.accent} />
        ) : filteredDeclarations.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={32} color={colors.placeholder} />
            <Text style={styles.emptyTitle}>{t('dashboard.emptyTitle')}</Text>
            <Text style={styles.emptyBody}>{t('dashboard.emptyBody')}</Text>
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

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.filterPill, active && styles.filterPillActive]} onPress={onPress}>
      <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>{label}</Text>
    </Pressable>
  );
}

function DeclarationRow({ item }: { item: Declaration }) {
  const tone = statusColors[item.status];
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons
          name={item.type === 'lost' ? 'map-marker-alert-outline' : 'hand-heart-outline'}
          size={20}
          color={splashColors.searchIcon}
        />
      </View>

      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {[item.category, item.location].filter(Boolean).join(' · ')}
        </Text>
        {!!item.reward && (
          <Text style={styles.rowReward}>
            {t('dashboard.reward')} : {item.reward}
          </Text>
        )}
      </View>

      <View style={[styles.statusPill, { backgroundColor: tone.background }]}>
        <Text style={[styles.statusPillText, { color: tone.text }]}>
          {t(`dashboard.status.${item.status}`)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: splashColors.gradientTop,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: splashColors.gradientBottom,
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
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  filterPillActive: {
    backgroundColor: colors.accent,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: colors.accentText,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  rowReward: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
