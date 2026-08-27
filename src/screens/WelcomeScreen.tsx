import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { splashColors } from '../theme/colors';

type Props = {
  onSignIn: () => void;
  onSignUp: () => void;
};

export default function WelcomeScreen({ onSignIn, onSignUp }: Props) {
  return (
    <LinearGradient
      colors={[splashColors.gradientTop, splashColors.gradientBottom]}
      style={styles.flex}
    >
      <View style={styles.content}>
        <View style={styles.logoBubble}>
          <MaterialCommunityIcons name="magnify" size={38} color={splashColors.searchIcon} />
        </View>
        <Text style={styles.brandName}>Findora</Text>

        <Text style={styles.welcomeTitle}>Bienvenue</Text>
        <Text style={styles.welcomeSubtitle}>Ce qui est perdu finit par se retrouver</Text>
      </View>

      <View style={styles.buttonsArea}>
        <Pressable style={styles.outlineButton} onPress={onSignIn}>
          <Text style={styles.outlineButtonText}>Connexion</Text>
        </Pressable>

        <Pressable style={styles.filledButton} onPress={onSignUp}>
          <Text style={styles.filledButtonText}>Inscription</Text>
        </Pressable>
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
  logoBubble: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: splashColors.searchBubble,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: splashColors.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    ...Platform.select({ android: { elevation: 20 } }),
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    color: splashColors.title,
    letterSpacing: 0.5,
  },
  welcomeTitle: {
    marginTop: 56,
    fontSize: 32,
    fontWeight: '700',
    color: splashColors.title,
  },
  welcomeSubtitle: {
    marginTop: 8,
    fontSize: 15,
    color: splashColors.slogan,
    textAlign: 'center',
  },
  buttonsArea: {
    paddingHorizontal: 32,
    paddingBottom: Platform.select({ ios: 48, default: 32 }),
    gap: 14,
  },
  outlineButton: {
    height: 54,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: splashColors.title,
  },
  filledButton: {
    height: 54,
    borderRadius: 999,
    backgroundColor: splashColors.searchBubble,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: splashColors.searchIcon,
  },
});
