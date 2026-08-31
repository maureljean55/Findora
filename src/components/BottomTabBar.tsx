import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, splashColors } from '../theme/colors';
import { t } from '../i18n';

export type TabKey = 'home' | 'history' | 'declare' | 'messages' | 'profile';

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

const SIDE_TABS: { key: TabKey; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }[] = [
  { key: 'home', icon: 'home-variant-outline', label: t('nav.home') },
  { key: 'history', icon: 'history', label: t('nav.history') },
];

const RIGHT_TABS: { key: TabKey; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }[] = [
  { key: 'messages', icon: 'message-text-outline', label: t('nav.messages') },
  { key: 'profile', icon: 'account-outline', label: t('nav.profile') },
];

export default function BottomTabBar({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { bottom: insets.bottom + 16 }]}>
      <View style={styles.bar}>
        {SIDE_TABS.map((tab) => (
          <TabButton key={tab.key} tab={tab} active={active === tab.key} onPress={() => onChange(tab.key)} />
        ))}

        <View style={styles.centerSpacer} />

        {RIGHT_TABS.map((tab) => (
          <TabButton key={tab.key} tab={tab} active={active === tab.key} onPress={() => onChange(tab.key)} />
        ))}
      </View>

      <Pressable style={styles.declareButtonWrap} onPress={() => onChange('declare')}>
        <LinearGradient
          colors={[splashColors.gradientTop, splashColors.gradientBottom]}
          style={styles.declareButton}
        >
          <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />
        </LinearGradient>
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
      {active ? (
        <MaskedView
          style={styles.iconSize}
          maskElement={<MaterialCommunityIcons name={tab.icon} size={20} color="#000000" />}
        >
          <LinearGradient
            colors={[splashColors.gradientTop, splashColors.gradientBottom]}
            style={styles.iconSize}
          />
        </MaskedView>
      ) : (
        <MaterialCommunityIcons name={tab.icon} size={20} color={colors.textSecondary} />
      )}
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    ...Platform.select({ android: { elevation: 8 } }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconSize: {
    width: 20,
    height: 20,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: splashColors.gradientTop,
  },
  centerSpacer: {
    width: 64,
  },
  declareButtonWrap: {
    position: 'absolute',
    top: -20,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: colors.background,
    shadowColor: splashColors.gradientTop,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    ...Platform.select({ android: { elevation: 6 } }),
  },
  declareButton: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
