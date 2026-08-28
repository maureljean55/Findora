import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, splashColors } from '../theme/colors';
import Button from '../components/Button';
import TextField from '../components/TextField';
import GoogleIcon from '../components/icons/GoogleIcon';
import DoorLoginAnimation, { DoorPhase } from '../components/DoorLoginAnimation';
import { supabase } from '../lib/supabase';
import { EMAIL_REGEX, PHONE_REGEX, normalizePhone, translateAuthError } from '../utils/validation';

type Mode = 'login' | 'signup';

type CountryCode = 'FR' | 'CI';

const COUNTRIES: { code: CountryCode; name: string; flag: string; dial: string }[] = [
  { code: 'FR', name: 'France', flag: '🇫🇷', dial: '+33' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', dial: '+225' },
];

type Errors = {
  fullName?: string;
  identifier?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
};

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);

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
  const [doorPhase, setDoorPhase] = useState<DoorPhase>('idle');

  const selectedCountry = COUNTRIES.find((item) => item.code === country)!;

  const { height: windowHeight } = useWindowDimensions();
  const isLoginFixed = Platform.OS === 'web' && mode === 'login';
  // Reference height the current spacing was designed for; shrink proportionally below it
  // so the whole login form fits without scrolling on shorter screens.
  const fitScale = isLoginFixed ? Math.min(1, Math.max(windowHeight / 800, 0.6)) : 1;

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

    if (mode === 'signup' && phoneNumber.trim().length < 6) {
      nextErrors.phoneNumber = 'Entrez un numéro de téléphone valide.';
    }

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
      const credentials = EMAIL_REGEX.test(trimmedIdentifier)
        ? { email: trimmedIdentifier, password }
        : { phone: normalizePhone(trimmedIdentifier), password };
      const { error } = await supabase.auth.signInWithPassword(credentials);
      setIsSubmitting(false);
      if (error) {
        setFormError(translateAuthError(error.message));
        setDoorPhase('error');
        return;
      }
      setFormSuccess(true);
      setDoorPhase('success');
    } else {
      const fullPhoneNumber = `${selectedCountry.dial}${normalizePhone(phoneNumber).replace(/^0+/, '')}`;
      const options = {
        data: { full_name: fullName.trim(), phone_number: fullPhoneNumber, country },
      };
      const credentials = EMAIL_REGEX.test(trimmedIdentifier)
        ? { email: trimmedIdentifier, password, options }
        : { phone: normalizePhone(trimmedIdentifier), password, options };
      const { error } = await supabase.auth.signUp(credentials);
      setIsSubmitting(false);
      if (error) {
        setFormError(translateAuthError(error.message));
        return;
      }
      setFormSuccess(true);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: brancher la connexion Google via Supabase Auth
  };

  const handleAppleLogin = () => {
    // TODO: brancher la connexion Apple via Supabase Auth
  };

  return (
    <LinearGradient
      colors={[splashColors.gradientTop, splashColors.gradientBottom]}
      style={styles.flex}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isLoginFixed && {
              flexGrow: 0,
              height: '100%',
              paddingTop: 40 * fitScale,
              paddingBottom: 16 * fitScale,
              justifyContent: 'center',
            },
          ]}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!isLoginFixed}
        >
          <View style={[styles.headerMessage, isLoginFixed && { marginBottom: 36 * fitScale }]}>
            <Text style={styles.headerTitle}>
              {mode === 'login' ? 'Connexion' : 'Créer un compte'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {mode === 'login'
                ? 'Accédez à votre compte Findora'
                : 'Rejoignez Findora en quelques secondes'}
            </Text>
          </View>

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
              label="Email"
              placeholder="Entrez votre email"
              value={identifier}
              onChangeText={setIdentifier}
              error={errors.identifier}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              variant="underline"
              tone="light"
              icon="account-outline"
            />

            {mode === 'signup' && (
              <View>
                <Text style={styles.countryLabel}>Pays</Text>
                <Pressable
                  style={styles.countrySelect}
                  onPress={() => setIsCountryPickerOpen((open) => !open)}
                >
                  <Text style={styles.countrySelectText}>
                    {selectedCountry.flag} {selectedCountry.name} ({selectedCountry.dial})
                  </Text>
                  <MaterialCommunityIcons
                    name={isCountryPickerOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="rgba(255, 255, 255, 0.7)"
                  />
                </Pressable>

                {isCountryPickerOpen && (
                  <View style={styles.countryOptions}>
                    {COUNTRIES.map((item) => (
                      <Pressable
                        key={item.code}
                        style={styles.countryOption}
                        onPress={() => {
                          setCountry(item.code);
                          setIsCountryPickerOpen(false);
                        }}
                      >
                        <Text style={styles.countryOptionText}>
                          {item.flag} {item.name} ({item.dial})
                        </Text>
                        {country === item.code && (
                          <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}

            {mode === 'signup' && (
              <TextField
                label="Numéro de téléphone"
                placeholder="612345678"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                error={errors.phoneNumber}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                variant="underline"
                tone="light"
                icon="phone-outline"
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
                  onPhaseComplete={() => setDoorPhase('idle')}
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

          {!isLoginFixed && <View style={styles.spacer} />}

          <Pressable
            style={[styles.switchLink, isLoginFixed && { marginTop: 20 * fitScale }]}
            onPress={() => switchMode(mode === 'login' ? 'signup' : 'login')}
          >
            <Text style={styles.switchLinkText}>
              {mode === 'login' ? "Pas de compte ? " : 'Déjà un compte ? '}
              <Text style={styles.switchLinkTextAccent}>
                {mode === 'login' ? "S'inscrire" : 'Se connecter'}
              </Text>
            </Text>
          </Pressable>
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
    paddingHorizontal: 32,
    paddingTop: 130,
    paddingBottom: 32,
    alignItems: 'center',
  },
  headerMessage: {
    width: '100%',
    marginBottom: 36,
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
  countryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 10,
  },
  countrySelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  countrySelectText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  countryOptions: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  countryOptionText: {
    fontSize: 14,
    color: '#FFFFFF',
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
