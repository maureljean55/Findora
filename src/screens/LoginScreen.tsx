import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import Button from '../components/Button';
import TextField from '../components/TextField';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s().-]{8,}$/;

type Errors = {
  identifier?: string;
  password?: string;
};

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): boolean => {
    const nextErrors: Errors = {};
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      nextErrors.identifier = 'Ce champ est requis.';
    } else if (!EMAIL_REGEX.test(trimmedIdentifier) && !PHONE_REGEX.test(trimmedIdentifier)) {
      nextErrors.identifier = 'Entrez un email ou un numéro de téléphone valide.';
    }

    if (!password) {
      nextErrors.password = 'Le mot de passe est requis.';
    } else if (password.length < 6) {
      nextErrors.password = 'Le mot de passe doit contenir au moins 6 caractères.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    // TODO: brancher l'authentification Supabase
  };

  const handleGoogleLogin = () => {
    // TODO: brancher la connexion Google via Supabase Auth
  };

  const handleAppleLogin = () => {
    // TODO: brancher la connexion Apple via Supabase Auth
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Accédez à votre compte Findora</Text>

          <View style={styles.form}>
            <TextField
              label="Email ou numéro de téléphone"
              placeholder="vous@exemple.com"
              value={identifier}
              onChangeText={setIdentifier}
              error={errors.identifier}
              keyboardType="email-address"
            />

            <TextField
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secure
            />

            <View style={styles.row}>
              <Pressable
                style={styles.checkboxRow}
                onPress={() => setStaySignedIn((value) => !value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: staySignedIn }}
              >
                <MaterialCommunityIcons
                  name={staySignedIn ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={20}
                  color={staySignedIn ? colors.accent : colors.textSecondary}
                />
                <Text style={styles.checkboxLabel}>Rester connecté</Text>
              </Pressable>

              <Pressable>
                <Text style={styles.link}>Mot de passe oublié ?</Text>
              </Pressable>
            </View>

            <Button label="Se connecter" onPress={handleLogin} />

            <View style={styles.separatorRow}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>ou continuer avec</Text>
              <View style={styles.separatorLine} />
            </View>

            <View style={styles.socialButtons}>
              <Button
                label="Continuer avec Google"
                variant="secondary"
                onPress={handleGoogleLogin}
                icon={<MaterialCommunityIcons name="google" size={18} color={colors.textPrimary} />}
              />
              <Button
                label="Continuer avec Apple"
                variant="secondary"
                onPress={handleAppleLogin}
                icon={<MaterialCommunityIcons name="apple" size={18} color={colors.textPrimary} />}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Pressable>
              <Text style={styles.footerLink}>
                Pas de compte ? <Text style={styles.footerLinkAccent}>Créer un compte</Text>
              </Text>
            </Pressable>

            <Pressable>
              <Text style={styles.anonymousLink}>Déclarer un objet sans compte</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  form: {
    marginTop: 28,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  link: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  separatorText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  socialButtons: {
    gap: 12,
  },
  footer: {
    marginTop: 28,
    alignItems: 'center',
    gap: 16,
  },
  footerLink: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerLinkAccent: {
    color: colors.accent,
    fontWeight: '600',
  },
  anonymousLink: {
    fontSize: 13,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
