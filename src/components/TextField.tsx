import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = TextInputProps & {
  label: string;
  error?: string;
  secure?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  variant?: 'filled' | 'underline';
  tone?: 'dark' | 'light';
};

export default function TextField({
  label,
  error,
  secure = false,
  icon,
  variant = 'filled',
  tone = 'dark',
  ...inputProps
}: Props) {
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(error);
  const isUnderline = variant === 'underline';
  const isLight = tone === 'light';
  const hasValue = typeof inputProps.value === 'string' && inputProps.value.length > 0;
  const iconColor = isLight ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          isUnderline && styles.labelUnderline,
          isLight && styles.labelLight,
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.inputRow,
          isUnderline && styles.inputRowUnderline,
          isUnderline && isLight && styles.inputRowUnderlineLight,
          isFocused && (isUnderline ? styles.inputRowUnderlineFocused : styles.inputRowFocused),
          hasError && (isUnderline ? styles.inputRowUnderlineError : styles.inputRowError),
        ]}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={isFocused && !isLight ? colors.accent : iconColor}
          />
        )}
        <TextInput
          style={[styles.input, isLight && styles.inputLight]}
          placeholderTextColor={isLight ? 'rgba(255, 255, 255, 0.45)' : colors.placeholder}
          secureTextEntry={secure && !isSecureVisible}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...inputProps}
        />
        {secure && (
          <Pressable
            onPress={() => setIsSecureVisible((visible) => !visible)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isSecureVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <MaterialCommunityIcons
              name={isSecureVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={iconColor}
            />
          </Pressable>
        )}
        {!secure && isUnderline && hasValue && (
          <MaterialCommunityIcons name="check" size={18} color={iconColor} />
        )}
      </View>
      {hasError && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  labelUnderline: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  labelLight: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.inputFill,
    gap: 10,
  },
  inputRowUnderline: {
    height: 44,
    borderWidth: 0,
    borderBottomWidth: 1.5,
    borderRadius: 0,
    borderBottomColor: colors.border,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  inputRowUnderlineLight: {
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputRowFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.background,
  },
  inputRowUnderlineFocused: {
    borderBottomColor: colors.accent,
  },
  inputRowError: {
    borderColor: colors.danger,
  },
  inputRowUnderlineError: {
    borderBottomColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    height: '100%',
    ...({ outlineStyle: 'none' } as object),
  },
  inputLight: {
    color: '#FFFFFF',
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: colors.danger,
  },
});
