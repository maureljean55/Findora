import React, { useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';

type Screen = 'splash' | 'onboarding' | 'auth';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');

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
      {screen === 'auth' && <AuthScreen />}
      <StatusBar style="auto" />
    </>
  );
}
