import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { splashColors } from '../theme/colors';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';

type Props = {
  onSignedOut: () => void;
};

export default function HomeScreen({ onSignedOut }: Props) {
  const [email, setEmail] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
    onSignedOut();
  };

  return (
    <LinearGradient
      colors={[splashColors.gradientTop, splashColors.gradientBottom]}
      style={styles.flex}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenue{email ? `,\n${email}` : ' sur Findora'}</Text>
        <Text style={styles.subtitle}>
          Ton espace Findora arrive bientôt : déclarations, matching et messagerie.
        </Text>

        <View style={styles.signOutButton}>
          <Button label="Se déconnecter" variant="outline" onPress={handleSignOut} loading={isSigningOut} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
  },
  signOutButton: {
    width: '100%',
    maxWidth: 320,
    marginTop: 40,
  },
});
