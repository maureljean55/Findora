import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, splashColors, statusColors } from '../theme/colors';
import { t } from '../i18n';
import type { Declaration } from '../types/declaration';

export default function DeclarationRow({ item }: { item: Declaration }) {
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
