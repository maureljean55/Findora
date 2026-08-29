import React, { useState } from 'react';
import {
  Dimensions,
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
import { colors, splashColors } from '../theme/colors';
import Button from '../components/Button';
import TextField from '../components/TextField';
import PhoneField from '../components/PhoneField';
import GoogleIcon from '../components/icons/GoogleIcon';
import DoorLoginAnimation, { DoorPhase } from '../components/DoorLoginAnimation';
import { supabase } from '../lib/supabase';
import { linkPendingPhone } from '../lib/linkPendingPhone';
import { signInWithProvider } from '../lib/oauth';
import { EMAIL_REGEX, PHONE_REGEX, normalizePhone, translateAuthError } from '../utils/validation';

type Mode = 'login' | 'signup';

type CountryCode = 'FR' | 'CI';

const COUNTRIES: {
  code: CountryCode;
  name: string;
  flag: string;
  dial: string;
  // Nombre de chiffres attendu dans le numéro local (hors indicatif)
  digits: number;
  // Certains pays (comme la France) affichent le numéro sans le 0 initial
  stripLeadingZero: boolean;
}[] = [
  { code: 'FR', name: 'France', flag: '🇫🇷', dial: '+33', digits: 9, stripLeadingZero: true },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', dial: '+225', digits: 10, stripLeadingZero: false },
];

const getPhoneDigits = (raw: string, country: (typeof COUNTRIES)[number]) => {
  let digits = normalizePhone(raw).replace(/\D/g, '');
  if (country.stripLeadingZero && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
};

type Errors = {
  fullName?: string;
  identifier?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
};

type Props = {
  onAuthenticated?: () => void;
};

export default function AuthScreen({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [staySignedIn, setStaySignedIn] = useState(false);

  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [country, setCountry] = useState<CountryCode>('FR');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [doorPhase, setDoorPhase] = useState<DoorPhase>('idle');

  const selectedCountry = COUNTRIES.find((item) => item.code === country)!;

  // Captured once on mount so on-screen keyboards (which shrink the visual
  // viewport on mobile Safari) don't retrigger this and shift the layout.
  const [initialWindowHeight] = useState(() => Dimensions.get('window').height);
  const isLoginFixed = Platform.OS === 'web' && mode === 'login';
  // Reference height the current spacing was designed for; shrink proportionally below it
  // so the whole login form fits without scrolling on shorter screens.
  const fitScale = isLoginFixed ? Math.min(1, Math.max(initialWindowHeight / 800, 0.6)) : 1;

  const switchMode = (nextMode: Mode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setErrors({});
    setFormError(null);
    setFormSuccess(false);
  };

  const validate = (): boolean => {
    const nextErrors: Errors = {};
    const trimmedIdentifier = identifier.trim();

    if (mode === 'signup' && fullName.trim().length < 2) {
      nextErrors.fullName = 'Entrez votre nom et prénom.';
    }

    if (mode === 'signup') {
      const phoneDigits = getPhoneDigits(phoneNumber, selectedCountry);
      if (phoneDigits.length !== selectedCountry.digits) {
        nextErrors.phoneNumber = `Entrez un numéro valide pour ${selectedCountry.name} (${selectedCountry.digits} chiffres).`;
      }
    }

    if (!trimmedIdentifier) {
      nextErrors.identifier = 'Ce champ est requis.';
    } else if (mode === 'signup') {
      if (!EMAIL_REGEX.test(trimmedIdentifier)) {
        nextErrors.identifier = 'Entrez un email valide.';
      }
    } else if (!EMAIL_REGEX.test(trimmedIdentifier) && !PHONE_REGEX.test(trimmedIdentifier)) {
      nextErrors.identifier = 'Entrez un email ou un numéro de téléphone valide.';
    }

    if (!password) {
      nextErrors.password = 'Le mot de passe est requis.';
    } else if (password.length < 6) {
      nextErrors.password = 'Le mot de passe doit contenir au moins 6 caractères.';
    }

    if (mode === 'signup' && confirmPassword !== password) {
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
    setIsSubmitting(true);

    if (mode === 'login') {
      setDoorPhase('checking');

      let loginEmail = trimmedIdentifier;
      if (!EMAIL_REGEX.test(trimmedIdentifier)) {
        // Le téléphone n'est pas une identité Supabase native ici : on
        // retrouve l'email associé via la table profiles (voir
        // linkPendingPhone), sans passer par le système phone/SMS de Supabase.
        const { data: resolvedEmail, error: lookupError } = await supabase.rpc('email_for_phone', {
          phone_input: normalizePhone(trimmedIdentifier),
        });
        if (lookupError || !resolvedEmail) {
          setIsSubmitting(false);
          setFormError(translateAuthError('Invalid login credentials'));
          setDoorPhase('error');
          return;
        }
        loginEmail = resolvedEmail;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });
      setIsSubmitting(false);
      if (error) {
        setFormError(translateAuthError(error.message));
        setDoorPhase('error');
        return;
      }
      // Rattrape le cas d'un compte créé avant confirmation de l'email : le
      // téléphone en attente n'a pas encore pu être lié à ce moment-là.
      linkPendingPhone(data.user);
      setFormSuccess(true);
      setDoorPhase('success');
    } else {
      const fullPhoneNumber = `${selectedCountry.dial}${getPhoneDigits(phoneNumber, selectedCountry)}`;
      const { data, error } = await supabase.auth.signUp({
        email: trimmedIdentifier,
        password,
        options: {
          data: { full_name: fullName.trim(), pending_phone: fullPhoneNumber, country },
        },
      });
      setIsSubmitting(false);
      if (error) {
        setFormError(translateAuthError(error.message));
        return;
      }
      setFormSuccess(true);
      // Une session est déjà active si la confirmation par email est désactivée
      // côté Supabase ; sinon il faut attendre que l'utilisateur confirme. Le
      // téléphone (pending_phone) est lié comme identité de connexion dans
      // linkPendingPhone, appelé dès qu'une session authentifiée existe.
      if (data.session) {
        await linkPendingPhone(data.session.user);
        onAuthenticated?.();
      }
    }
  };

  const handleGoogleLogin = async () => {
    setFormError(null);
    setFormSuccess(false);
    setIsGoogleSubmitting(true);
    try {
      const completed = await signInWithProvider('google');
      if (completed) {
        setFormSuccess(true);
        onAuthenticated?.();
      }
    } catch {
      setFormError('Impossible de se connecter avec Google. Réessayez.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleAppleLogin = () => {
    setFormError(null);
    setFormSuccess(false);
    setFormError("La connexion avec Apple arrive bientôt.");
  };

  const formBody = (
    <>
      <View style={[styles.fields, isLoginFixed && { gap: 24 * fitScale }]}>
            {mode === 'signup' && (
              <TextField
                label="Nom complet"
                placeholder="Jean N'Cho"
                value={fullName}
                onChangeText={setFullName}
                error={errors.fullName}
                textContentType="name"
                autoComplete="name"
                variant="underline"
                tone="light"
                icon="account-outline"
              />
            )}

            <TextField
              label={mode === 'login' ? 'Email ou téléphone' : 'Email'}
              placeholder={mode === 'login' ? 'Entrez votre email ou téléphone' : 'Entrez votre email'}
              value={identifier}
              onChangeText={setIdentifier}
              error={errors.identifier}
              keyboardType={mode === 'login' ? 'default' : 'email-address'}
              textContentType={mode === 'login' ? 'username' : 'emailAddress'}
              autoComplete={mode === 'login' ? 'username' : 'email'}
              variant="underline"
              tone="light"
              icon="account-outline"
            />

            {mode === 'signup' && (
              <PhoneField
                label="Numéro de téléphone"
                placeholder="612345678"
                countries={COUNTRIES}
                selectedCountry={selectedCountry}
                onSelectCountry={(code) => setCountry(code as CountryCode)}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                error={errors.phoneNumber}
              />
            )}

            <TextField
              label="Mot de passe"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secure
              textContentType={mode === 'login' ? 'password' : 'newPassword'}
              autoComplete={mode === 'login' ? 'password' : 'password-new'}
              variant="underline"
              tone="light"
              icon="lock-outline"
            />

            {mode === 'signup' && (
              <TextField
                label="Confirmer le mot de passe"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={errors.confirmPassword}
                secure
                textContentType="newPassword"
                autoComplete="password-new"
                variant="underline"
                tone="light"
                icon="lock-outline"
              />
            )}
          </View>

          {mode === 'login' && (
            <View style={[styles.optionsRow, isLoginFixed && { marginTop: 20 * fitScale }]}>
              <Pressable
                style={styles.staySignedInRow}
                onPress={() => setStaySignedIn((value) => !value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: staySignedIn }}
              >
                <MaterialCommunityIcons
                  name={staySignedIn ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={20}
                  color={staySignedIn ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}
                />
                <Text style={styles.staySignedInText}>Rester connecté</Text>
              </Pressable>

              <Pressable>
                <Text style={styles.helpLinkText}>Mot de passe oublié ?</Text>
              </Pressable>
            </View>
          )}

          {formError && <Text style={styles.formError}>{formError}</Text>}
          {formSuccess && (
            <Text style={styles.formSuccess}>
              {mode === 'login'
                ? 'Connexion réussie !'
                : 'Compte créé ! Vérifiez votre boîte mail pour le confirmer.'}
            </Text>
          )}

          <View style={[styles.buttonSpacer, isLoginFixed && { height: 24 * fitScale }]} />

          {mode === 'login' ? (
            <Pressable
              style={styles.doorButton}
              onPress={handleSubmit}
              disabled={isSubmitting || doorPhase !== 'idle'}
            >
              {doorPhase === 'idle' ? (
                <Text style={styles.doorButtonText}>Se connecter</Text>
              ) : (
                <DoorLoginAnimation
                  phase={doorPhase}
                  onPhaseComplete={() => {
                    if (doorPhase === 'success') {
                      onAuthenticated?.();
                    } else {
                      setDoorPhase('idle');
                    }
                  }}
                />
              )}
            </Pressable>
          ) : (
            <Button
              label="S'inscrire"
              variant="outline"
              onPress={handleSubmit}
              loading={isSubmitting}
            />
          )}

          {mode === 'login' && (
            <>
              <View
                style={[
                  styles.separatorRow,
                  isLoginFixed && { marginTop: 24 * fitScale, marginBottom: 16 * fitScale },
                ]}
              >
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>ou continuer avec</Text>
                <View style={styles.separatorLine} />
              </View>

              <View style={[styles.socialButtons, isLoginFixed && { gap: 12 * fitScale }]}>
                <Button
                  label="Continuer avec Google"
                  variant="secondary"
                  onPress={handleGoogleLogin}
                  loading={isGoogleSubmitting}
                  icon={<GoogleIcon size={18} />}
                />
                <Button
                  label="Continuer avec Apple"
                  variant="secondary"
                  onPress={handleAppleLogin}
                  icon={<MaterialCommunityIcons name="apple" size={18} color={colors.textPrimary} />}
                />
              </View>

              <Pressable
                style={[styles.anonymousLink, isLoginFixed && { marginTop: 16 * fitScale }]}
              >
                <MaterialCommunityIcons name="flash-outline" size={16} color="#FFFFFF" />
                <Text style={styles.anonymousLinkText}>Déclarer un objet sans compte</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color="#FFFFFF" />
              </Pressable>
            </>
          )}
        </>
  );

  return (
    <LinearGradient
      colors={[splashColors.gradientTop, splashColors.gradientBottom]}
      style={styles.flex}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {mode === 'signup' ? (
          <>
            <View style={styles.signupHeaderWrap}>
              <Text style={styles.headerTitle}>Créer un compte</Text>
              <Text style={styles.headerSubtitle}>Rejoignez Findora en quelques secondes</Text>
            </View>

            <ScrollView
              style={styles.signupScrollView}
              contentContainerStyle={styles.signupScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {formBody}
            </ScrollView>

            <View style={styles.signupFooterWrap}>
              <Pressable style={[styles.switchLink, { marginTop: 0 }]} onPress={() => switchMode('login')}>
                <Text style={styles.switchLinkText}>
                  Déjà un compte ?{' '}
                  <Text style={styles.switchLinkTextAccent}>Se connecter</Text>
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              isLoginFixed && {
                flexGrow: 0,
                height: '100%',
                paddingTop: 40 * fitScale,
                paddingBottom: 16 * fitScale,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={!isLoginFixed}
          >
            <View style={[styles.headerMessage, isLoginFixed && { marginBottom: 36 * fitScale }]}>
              <Text style={styles.headerTitle}>Connexion</Text>
              <Text style={styles.headerSubtitle}>Accédez à votre compte Findora</Text>
            </View>

            {formBody}

            {!isLoginFixed && <View style={styles.spacer} />}

            <Pressable
              style={[styles.switchLink, isLoginFixed && { marginTop: 20 * fitScale }]}
              onPress={() => switchMode('signup')}
            >
              <Text style={styles.switchLinkText}>
                Pas de compte ? <Text style={styles.switchLinkTextAccent}>S'inscrire</Text>
              </Text>
            </Pressable>
          </ScrollView>
        )}
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
    paddingHorizontal: 32,
    paddingTop: 130,
    paddingBottom: 32,
    alignItems: 'center',
  },
  headerMessage: {
    width: '100%',
    marginBottom: 36,
  },
  signupHeaderWrap: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: Platform.select({ web: 32, default: 108 }),
    paddingBottom: 16,
  },
  signupScrollView: {
    flex: 1,
  },
  signupScrollContent: {
    paddingHorizontal: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },
  signupFooterWrap: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: Platform.select({ ios: 24, default: 16 }),
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  fields: {
    width: '100%',
    gap: 24,
  },
  optionsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  staySignedInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  staySignedInText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  helpLinkText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  separatorRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  separatorText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  socialButtons: {
    width: '100%',
    gap: 12,
  },
  anonymousLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  anonymousLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonSpacer: {
    height: 24,
  },
  doorButton: {
    width: '100%',
    height: 54,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doorButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  formError: {
    marginTop: 16,
    fontSize: 13,
    color: '#FF9D9D',
    textAlign: 'center',
  },
  formSuccess: {
    marginTop: 16,
    fontSize: 13,
    color: '#8CE6B0',
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  switchLink: {
    marginTop: 20,
  },
  switchLinkText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  switchLinkTextAccent: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
