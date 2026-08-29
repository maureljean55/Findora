import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import { supabase } from './src/lib/supabase';

type Screen = 'checking' | 'splash' | 'onboarding' | 'auth' | 'home';

export default function App() {
  const [screen, setScreen] = useState<Screen>('checking');

  useEffect(() => {
    // Une session déjà active (ex: retour de connexion Google sur le web,
    // qui recharge toute la page) doit sauter le splash/onboarding et l'écran
    // de connexion pour aller directement à l'accueil.
    supabase.auth.getSession().then(({ data }) => {
      setScreen(data.session ? 'home' : 'splash');
    });
  }, []);

  const handleSplashFinished = useCallback(() => {
    setScreen('onboarding');
  }, []);

  const navigateToAuth = useCallback(() => setScreen('auth'), []);
  const navigateToHome = useCallback(() => setScreen('home'), []);

  return (
    <>
      {screen === 'splash' && <SplashScreen onFinished={handleSplashFinished} />}
      {screen === 'onboarding' && (
        <OnboardingScreen onSkip={navigateToAuth} onFinish={navigateToAuth} />
      )}
      {screen === 'auth' && <AuthScreen onAuthenticated={navigateToHome} />}
      {screen === 'home' && <HomeScreen onSignedOut={navigateToAuth} />}
      <StatusBar style="auto" />
    </>
  );
}
