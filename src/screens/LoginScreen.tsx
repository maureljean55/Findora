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
import AuthHeader from '../components/AuthHeader';
import GoogleIcon from '../components/icons/GoogleIcon';
import { supabase } from '../lib/supabase';
import { EMAIL_REGEX, PHONE_REGEX, normalizePhone, translateAuthError } from '../utils/validation';

type Errors = {
  identifier?: string;
  password?: string;
};

type Props = {
  onNavigateBack: () => void;
  onNavigateToSignup: () => void;
};

export default function LoginScreen({ onNavigateBack, onNavigateToSignup }: Props) {
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
    <View style={styles.flex}>
      <AuthHeader title={'Bonjour,\nConnexion !'} onBack={onNavigateBack} />

      <KeyboardAvoidingView
        style={styles.sheet}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TextField
            label="Email ou téléphone"
            placeholder="vous@exemple.com"
            value={identifier}
            onChangeText={setIdentifier}
            error={errors.identifier}
            keyboardType="email-address"
            variant="underline"
          />

          <TextField
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secure
            variant="underline"
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

          <Button
            label="Se connecter"
            variant="gradient"
            onPress={handleLogin}
            loading={isSubmitting}
          />

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

          <View style={styles.footer}>
            <Pressable onPress={onNavigateToSignup} style={styles.footerLinkWrap}>
              <Text style={styles.footerLink}>Pas de compte ?</Text>
              <Text style={styles.footerLinkAccent}>Créer un compte</Text>
            </Pressable>

            <Pressable style={styles.anonymousLink}>
              <MaterialCommunityIcons name="flash-outline" size={16} color={colors.accent} />
              <Text style={styles.anonymousLinkText}>Déclarer un objet sans compte</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.accent} />
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 28,
    paddingTop: 28,
    gap: 18,
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
    marginTop: 10,
    alignItems: 'center',
    gap: 16,
  },
  footerLinkWrap: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  footerLink: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerLinkAccent: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '700',
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
