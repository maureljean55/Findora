import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, splashColors } from '../theme/colors';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gradient' | 'light' | 'outline';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
}: Props) {
  const isPrimary = variant === 'primary';
  const isGradient = variant === 'gradient';
  const isLight = variant === 'light';
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        variant === 'secondary' && styles.secondary,
        isGradient && styles.gradientBase,
        isLight && styles.light,
        isOutline && styles.outline,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
      ]}
    >
      {isGradient && (
        <LinearGradient
          colors={[splashColors.gradientTop, splashColors.gradientBottom]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {loading ? (
        <ActivityIndicator
          color={isPrimary || isGradient || isOutline ? colors.accentText : splashColors.searchIcon}
        />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            style={[
              styles.label,
              isPrimary || isGradient || isOutline ? styles.primaryLabel : styles.secondaryLabel,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    ...Platform.select({ android: { elevation: 4 } }),
  },
  secondary: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  gradientBase: {
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: splashColors.gradientBottom,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    ...Platform.select({ android: { elevation: 5 } }),
  },
  light: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  outline: {
    height: 54,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryLabel: {
    color: colors.accentText,
  },
  secondaryLabel: {
    color: colors.textPrimary,
  },
});
