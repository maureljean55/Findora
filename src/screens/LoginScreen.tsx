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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import Button from '../components/Button';
import TextField from '../components/TextField';
import GoogleIcon from '../components/icons/GoogleIcon';
import { supabase } from '../lib/supabase';
import { EMAIL_REGEX, PHONE_REGEX, normalizePhone, translateAuthError } from '../utils/validation';

type Errors = {
  identifier?: string;
  password?: string;
};

type Props = {
  onNavigateToSignup: () => void;
};

export default function LoginScreen({ onNavigateToSignup }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleLogin = async () => {
    setFormError(null);
    setFormSuccess(false);
    if (!validate()) return;

    const trimmedIdentifier = identifier.trim();
    const credentials = EMAIL_REGEX.test(trimmedIdentifier)
      ? { email: trimmedIdentifier, password }
      : { phone: normalizePhone(trimmedIdentifier), password };

    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword(credentials);
    setIsSubmitting(false);

    if (error) {
      setFormError(translateAuthError(error.message));
      return;
    }

    setFormSuccess(true);
  };

  const handleGoogleLogin = () => {
    // TODO: brancher la connexion Google via Supabase Auth
  };

  const handleAppleLogin = () => {
    // TODO: brancher la connexion Apple via Supabase Auth
  };

  return (
    <LinearGradient
      colors={[colors.screenGradientTop, colors.screenGradientBottom]}
      style={styles.flex}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.tagline}>
            <Text style={styles.taglineQuestion}>Objet perdu ?{'\n'}</Text>
            <Text style={styles.taglineAnswer}>Nous le retrouvons.</Text>
          </Text>

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
                icon="at"
              />

              <TextField
                label="Mot de passe"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                secure
                icon="lock-outline"
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

              {formError && <Text style={styles.formError}>{formError}</Text>}
              {formSuccess && <Text style={styles.formSuccess}>Connexion réussie !</Text>}

              <Button label="Se connecter" onPress={handleLogin} loading={isSubmitting} />

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
                  icon={<GoogleIcon size={18} />}
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
              <Pressable onPress={onNavigateToSignup}>
                <Text style={styles.footerLink}>
                  Pas de compte ? <Text style={styles.footerLinkAccent}>Créer un compte</Text>
                </Text>
              </Pressable>

              <Pressable style={styles.anonymousLink}>
                <MaterialCommunityIcons name="flash-outline" size={16} color={colors.accent} />
                <Text style={styles.anonymousLinkText}>Déclarer un objet sans compte</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.accent} />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  tagline: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 30,
  },
  taglineQuestion: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  taglineAnswer: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.accent,
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
  formError: {
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
  },
  formSuccess: {
    fontSize: 13,
    color: '#1B8A5A',
    textAlign: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(47, 111, 237, 0.25)',
  },
  anonymousLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
});
