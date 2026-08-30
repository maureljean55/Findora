import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  onSave: (next: string) => Promise<void>;
};

export default function EditableRow({ icon, label, value, placeholder, keyboardType, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setDraft(value);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <View style={styles.editingRow}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={icon} size={18} color={colors.textPrimary} />
        </View>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoFocus
        />
        {saving ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <>
            <Pressable onPress={() => setEditing(false)} style={styles.iconButton}>
              <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={handleSave} style={styles.iconButton}>
              <MaterialCommunityIcons name="check" size={18} color={colors.accent} />
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <Pressable style={styles.row} onPress={startEditing}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={icon} size={18} color={colors.textPrimary} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={1}>
          {value || placeholder}
        </Text>
      </View>
      <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.placeholder} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 4,
  },
  iconButton: {
    padding: 4,
  },
});
