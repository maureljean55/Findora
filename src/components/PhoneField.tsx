import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export type Country = {
  code: string;
  name: string;
  flag: string;
  dial: string;
};

type Props = {
  label: string;
  countries: Country[];
  selectedCountry: Country;
  onSelectCountry: (code: string) => void;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
};

export default function PhoneField({
  label,
  countries,
  selectedCountry,
  onSelectCountry,
  value,
  onChangeText,
  error,
  placeholder,
}: Props) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.row,
          isFocused && styles.rowFocused,
          hasError && styles.rowError,
        ]}
      >
        <Pressable
          style={styles.flagButton}
          onPress={() => setIsPickerOpen((open) => !open)}
          hitSlop={8}
        >
          <Text style={styles.flagText}>{selectedCountry.flag}</Text>
          <MaterialCommunityIcons
            name={isPickerOpen ? 'chevron-up' : 'chevron-down'}
            size={14}
            color="rgba(255, 255, 255, 0.7)"
          />
        </Pressable>

        <Text style={styles.dialCode}>{selectedCountry.dial}</Text>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.45)"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      {hasError && <Text style={styles.error}>{error}</Text>}

      {isPickerOpen && (
        <View style={styles.dropdown}>
          {countries.map((item) => (
            <Pressable
              key={item.code}
              style={styles.dropdownOption}
              onPress={() => {
                onSelectCountry(item.code);
                setIsPickerOpen(false);
              }}
            >
              <Text style={styles.dropdownOptionText}>
                {item.flag} {item.name} ({item.dial})
              </Text>
              {selectedCountry.code === item.code && (
                <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  rowFocused: {
    borderBottomColor: colors.accent,
  },
  rowError: {
    borderBottomColor: colors.danger,
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  flagText: {
    fontSize: 17,
  },
  dialCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    height: '100%',
    marginLeft: 4,
    ...({ outlineStyle: 'none' } as object),
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: colors.danger,
  },
  dropdown: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});
