import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, splashColors } from '../theme/colors';
import { t } from '../i18n';

export type TabKey = 'home' | 'search' | 'declare' | 'messages' | 'profile';

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

const SIDE_TABS: { key: TabKey; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }[] = [
  { key: 'home', icon: 'home-variant-outline', label: t('nav.home') },
  { key: 'search', icon: 'magnify', label: t('nav.search') },
];

const RIGHT_TABS: { key: TabKey; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }[] = [
  { key: 'messages', icon: 'message-text-outline', label: t('nav.messages') },
  { key: 'profile', icon: 'account-outline', label: t('nav.profile') },
];

export default function BottomTabBar({ active, onChange }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {SIDE_TABS.map((tab) => (
          <TabButton key={tab.key} tab={tab} active={active === tab.key} onPress={() => onChange(tab.key)} />
        ))}

        <View style={styles.centerSpacer} />

        {RIGHT_TABS.map((tab) => (
          <TabButton key={tab.key} tab={tab} active={active === tab.key} onPress={() => onChange(tab.key)} />
        ))}
      </View>

      <Pressable style={styles.declareButton} onPress={() => onChange('declare')}>
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function TabButton({
  tab,
  active,
  onPress,
}: {
  tab: { key: TabKey; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string };
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.tabButton} onPress={onPress}>
      <MaterialCommunityIcons
        name={tab.icon}
        size={22}
        color={active ? colors.accent : colors.textSecondary}
      />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 64,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.select({ ios: 6, default: 0 }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  centerSpacer: {
    width: 64,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  declareButton: {
    position: 'absolute',
    top: -22,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: splashColors.gradientTop,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: splashColors.gradientTop,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    ...Platform.select({ android: { elevation: 6 } }),
  },
});
