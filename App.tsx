import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import { supabase } from './src/lib/supabase';

type Screen = 'checking' | 'splash' | 'onboarding' | 'auth';

export default function App() {
  const [screen, setScreen] = useState<Screen>('checking');
  const [hasExistingSession, setHasExistingSession] = useState(false);

  useEffect(() => {
    // Une session déjà active (ex: retour de connexion Google sur le web,
    // qui recharge toute la page) doit sauter le splash/onboarding.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setHasExistingSession(true);
        setScreen('auth');
      } else {
        setScreen('splash');
      }
    });
  }, []);

  const handleSplashFinished = useCallback(() => {
    setScreen('onboarding');
  }, []);

  const navigateToAuth = useCallback(() => setScreen('auth'), []);

  return (
    <>
      {screen === 'splash' && <SplashScreen onFinished={handleSplashFinished} />}
      {screen === 'onboarding' && (
        <OnboardingScreen onSkip={navigateToAuth} onFinish={navigateToAuth} />
      )}
      {screen === 'auth' && <AuthScreen initialSignedIn={hasExistingSession} />}
      <StatusBar style="auto" />
    </>
  );
}
