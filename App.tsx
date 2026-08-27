import React, { useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

type Screen = 'splash' | 'onboarding' | 'login' | 'signup';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');

  const handleSplashFinished = useCallback(() => {
    setScreen('onboarding');
  }, []);

  const navigateToSignup = useCallback(() => setScreen('signup'), []);
  const navigateToLogin = useCallback(() => setScreen('login'), []);
  const navigateToOnboarding = useCallback(() => setScreen('onboarding'), []);

  return (
    <>
      {screen === 'splash' && <SplashScreen onFinished={handleSplashFinished} />}
      {screen === 'onboarding' && (
        <OnboardingScreen onSkip={navigateToLogin} onFinish={navigateToLogin} />
      )}
      {screen === 'login' && (
        <LoginScreen onNavigateBack={navigateToOnboarding} onNavigateToSignup={navigateToSignup} />
      )}
      {screen === 'signup' && (
        <SignupScreen onNavigateBack={navigateToOnboarding} onNavigateToLogin={navigateToLogin} />
      )}
      <StatusBar style="auto" />
    </>
  );
}
