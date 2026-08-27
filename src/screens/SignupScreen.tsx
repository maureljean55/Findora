import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import TextField from '../components/TextField';
import { supabase } from '../lib/supabase';
import { EMAIL_REGEX, PHONE_REGEX, normalizePhone, translateAuthError } from '../utils/validation';

const TOTAL_STEPS = 4;
type Step = 1 | 2 | 3 | 4;

const STEP_SUBTITLES: Record<Step, string> = {
  1: 'Comment vous appelez-vous ?',
  2: 'Quel est votre email ou numéro de téléphone ?',
  3: 'Choisissez un mot de passe.',
  4: 'Confirmez votre mot de passe.',
};

type Errors = {
  fullName?: string;
  identifier?: string;
  password?: string;
  confirmPassword?: string;
};

type Props = {
  onNavigateToLogin: () => void;
};

export default function SignupScreen({ onNavigateToLogin }: Props) {
  const [step, setStep] = useState<Step>(1);

  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep = (targetStep: Step): boolean => {
    const nextErrors: Errors = {};

    if (targetStep === 1) {
      if (fullName.trim().length < 2) {
        nextErrors.fullName = 'Entrez votre nom et prénom.';
      }
    }

    if (targetStep === 2) {
      const trimmedIdentifier = identifier.trim();
      if (!trimmedIdentifier) {
        nextErrors.identifier = 'Ce champ est requis.';
      } else if (!EMAIL_REGEX.test(trimmedIdentifier) && !PHONE_REGEX.test(trimmedIdentifier)) {
        nextErrors.identifier = 'Entrez un email ou un numéro de téléphone valide.';
      }
    }

    if (targetStep === 3) {
      if (!password) {
        nextErrors.password = 'Le mot de passe est requis.';
      } else if (password.length < 6) {
        nextErrors.password = 'Le mot de passe doit contenir au moins 6 caractères.';
      }
    }

    if (targetStep === 4) {
      if (confirmPassword !== password) {
        nextErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setFormError(null);
    setStep((current) => (current < TOTAL_STEPS ? ((current + 1) as Step) : current));
  };

  const handleBack = () => {
    setFormError(null);
    setStep((current) => (current > 1 ? ((current - 1) as Step) : current));
  };

  const handleSubmit = async () => {
    setFormError(null);
    setFormSuccess(false);
    if (!validateStep(4)) return;

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

  const handleForward = step < TOTAL_STEPS ? handleNext : handleSubmit;

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
          <View style={styles.card}>
            <Pressable
              style={styles.backButton}
              onPress={onNavigateToLogin}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Retour à la connexion"
            >
              <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textPrimary} />
            </Pressable>

            <Text style={styles.title}>Bienvenue sur Findora</Text>
            <Text style={styles.subtitle}>{STEP_SUBTITLES[step]}</Text>

            <View style={styles.progressRow}>
              {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                <View
                  key={index}
                  style={[styles.progressSegment, index < step && styles.progressSegmentActive]}
                />
              ))}
            </View>
            <Text style={styles.stepLabel}>
              Étape {step} sur {TOTAL_STEPS}
            </Text>

            <View style={styles.form}>
              {step === 1 && (
                <TextField
                  label="Nom et prénom"
                  placeholder="Jean N'Cho"
                  value={fullName}
                  onChangeText={setFullName}
                  error={errors.fullName}
                  icon="account-outline"
                  autoComplete="name"
                />
              )}

              {step === 2 && (
                <TextField
                  label="Email ou numéro de téléphone"
                  placeholder="vous@exemple.com"
                  value={identifier}
                  onChangeText={setIdentifier}
                  error={errors.identifier}
                  keyboardType="email-address"
                  icon="at"
                />
              )}

              {step === 3 && (
                <TextField
                  label="Mot de passe"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                  secure
                  icon="lock-outline"
                />
              )}

              {step === 4 && (
                <TextField
                  label="Confirmer le mot de passe"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  error={errors.confirmPassword}
                  secure
                  icon="lock-check-outline"
                />
              )}

              {formError && <Text style={styles.formError}>{formError}</Text>}
              {formSuccess && (
                <Text style={styles.formSuccess}>
                  Compte créé ! Vérifiez votre boîte mail pour le confirmer.
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.navRow}>
          <View style={styles.navSlot}>
            {step > 1 && (
              <Pressable style={styles.navLinkBack} onPress={handleBack}>
                <Text style={styles.navLinkBackText}>Précédent</Text>
              </Pressable>
            )}
          </View>

          <Pressable
            style={styles.navLinkForward}
            onPress={handleForward}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.accentText} size="small" />
            ) : (
              <>
                <Text style={styles.navLinkForwardText}>
                  {step < TOTAL_STEPS ? 'Suivant' : 'Créer mon compte'}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color={colors.accentText} />
              </>
            )}
          </Pressable>
        </View>
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
    padding: 24,
    paddingTop: 72,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginLeft: -8,
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
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 24,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  progressSegmentActive: {
    backgroundColor: colors.accent,
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
  },
  form: {
    marginTop: 20,
    gap: 16,
    minHeight: 90,
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
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.select({ ios: 32, default: 20 }),
  },
  navSlot: {
    flexShrink: 1,
  },
  navLinkBack: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  navLinkBackText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  navLinkForward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 2,
    justifyContent: 'center',
  },
  navLinkForwardText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentText,
  },
});
