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
};

export default function TextField({
  label,
  error,
  secure = false,
  icon,
  variant = 'filled',
  ...inputProps
}: Props) {
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(error);
  const isUnderline = variant === 'underline';
  const hasValue = typeof inputProps.value === 'string' && inputProps.value.length > 0;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isUnderline && styles.labelUnderline]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          isUnderline && styles.inputRowUnderline,
          isFocused && (isUnderline ? styles.inputRowUnderlineFocused : styles.inputRowFocused),
          hasError && (isUnderline ? styles.inputRowUnderlineError : styles.inputRowError),
        ]}
      >
        {icon && !isUnderline && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={isFocused ? colors.accent : colors.textSecondary}
          />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.placeholder}
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
              color={colors.textSecondary}
            />
          </Pressable>
        )}
        {!secure && isUnderline && hasValue && (
          <MaterialCommunityIcons name="check" size={18} color={colors.textSecondary} />
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
    fontSize: 15,
    color: colors.textPrimary,
    height: '100%',
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: colors.danger,
  },
});
