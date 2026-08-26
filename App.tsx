import React, { useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const handleSplashFinished = useCallback(() => {
    setIsSplashVisible(false);
  }, []);

  return (
    <>
      {isSplashVisible ? (
        <SplashScreen onFinished={handleSplashFinished} />
      ) : (
        <LoginScreen />
      )}
      <StatusBar style="auto" />
    </>
  );
}
