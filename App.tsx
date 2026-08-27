import React, { useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

type Screen = 'splash' | 'welcome' | 'login' | 'signup';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');

  const handleSplashFinished = useCallback(() => {
    setScreen('welcome');
  }, []);

  const navigateToSignup = useCallback(() => setScreen('signup'), []);
  const navigateToLogin = useCallback(() => setScreen('login'), []);

  return (
    <>
      {screen === 'splash' && <SplashScreen onFinished={handleSplashFinished} />}
      {screen === 'welcome' && (
        <WelcomeScreen onSignIn={navigateToLogin} onSignUp={navigateToSignup} />
      )}
      {screen === 'login' && <LoginScreen onNavigateToSignup={navigateToSignup} />}
      {screen === 'signup' && <SignupScreen onNavigateToLogin={navigateToLogin} />}
      <StatusBar style="auto" />
    </>
  );
}
