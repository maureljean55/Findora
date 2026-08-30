import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: { value: boolean; onChange: (next: boolean) => void };
  disabled?: boolean;
};

export default function SettingsRow({ icon, label, value, onPress, toggle, disabled }: Props) {
  const content = (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={icon} size={18} color={colors.textPrimary} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      {toggle ? (
        <Switch value={toggle.value} onValueChange={toggle.onChange} disabled={disabled} />
      ) : (
        <View style={styles.trailing}>
          {!!value && (
            <Text style={styles.value} numberOfLines={2}>
              {value}
            </Text>
          )}
          {onPress && <MaterialCommunityIcons name="chevron-right" size={18} color={colors.placeholder} />}
        </View>
      )}
    </View>
  );

  if (!onPress || toggle) return content;

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 170,
  },
  value: {
    flexShrink: 1,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
});
