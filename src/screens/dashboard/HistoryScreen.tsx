import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { t } from '../../i18n';
import DeclarationRow from '../../components/DeclarationRow';
import type { Declaration } from '../../types/declaration';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('declarations')
      .select('id, type, category, title, location, reward, status, created_at')
      .in('status', ['resolved', 'archived'])
      .order('created_at', { ascending: false });
    setDeclarations((data as Declaration[] | null) ?? []);
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

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Text style={styles.title}>{t('history.title')}</Text>

      {loading ? (
        <ActivityIndicator style={styles.loading} color={colors.accent} />
      ) : declarations.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="archive-outline" size={32} color={colors.placeholder} />
          <Text style={styles.emptyTitle}>{t('history.emptyTitle')}</Text>
          <Text style={styles.emptyBody}>{t('history.emptyBody')}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {declarations.map((item) => (
            <DeclarationRow key={item.id} item={item} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  loading: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 60,
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
    marginTop: 20,
    gap: 12,
  },
});
