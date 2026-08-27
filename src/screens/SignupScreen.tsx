import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import Button from '../components/Button';
import TextField from '../components/TextField';
import AuthHeader from '../components/AuthHeader';
import { supabase } from '../lib/supabase';
import { EMAIL_REGEX, PHONE_REGEX, normalizePhone, translateAuthError } from '../utils/validation';

type Errors = {
  fullName?: string;
  identifier?: string;
  password?: string;
  confirmPassword?: string;
};

type Props = {
  onNavigateBack: () => void;
  onNavigateToLogin: () => void;
};

export default function SignupScreen({ onNavigateBack, onNavigateToLogin }: Props) {
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const nextErrors: Errors = {};

    if (fullName.trim().length < 2) {
      nextErrors.fullName = 'Entrez votre nom et prénom.';
    }

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

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    setFormError(null);
    setFormSuccess(false);
    if (!validate()) return;

    const trimmedIdentifier = identifier.trim();
    const options = { data: { full_name: fullName.trim() } };
    const credentials = EMAIL_REGEX.test(trimmedIdentifier)
      ? { email: trimmedIdentifier, password, options }
      : { phone: normalizePhone(trimmedIdentifier), password, options };

    setIsSubmitting(true);
    const { error } = await supabase.auth.signUp(credentials);
    setIsSubmitting(false);

    if (error) {
      setFormError(translateAuthError(error.message));
      return;
    }

    setFormSuccess(true);
  };

  return (
    <View style={styles.flex}>
      <AuthHeader title={'Créer un\ncompte'} onBack={onNavigateBack} />

      <KeyboardAvoidingView
        style={styles.sheet}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TextField
            label="Nom complet"
            placeholder="Jean N'Cho"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            autoComplete="name"
            variant="underline"
          />

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

          <TextField
            label="Confirmer le mot de passe"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secure
            variant="underline"
          />

          {formError && <Text style={styles.formError}>{formError}</Text>}
          {formSuccess && (
            <Text style={styles.formSuccess}>
              Compte créé ! Vérifiez votre boîte mail pour le confirmer.
            </Text>
          )}

          <Button
            label="Créer mon compte"
            variant="gradient"
            onPress={handleSubmit}
            loading={isSubmitting}
          />

          <Pressable onPress={onNavigateToLogin} style={styles.footerLinkWrap}>
            <Text style={styles.footerLink}>Déjà un compte ?</Text>
            <Text style={styles.footerLinkAccent}>Se connecter</Text>
          </Pressable>
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
    paddingBottom: 40,
    gap: 18,
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
  footerLinkWrap: {
    marginTop: 6,
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
});
