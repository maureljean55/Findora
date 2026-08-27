import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { splashColors } from '../theme/colors';

type Props = {
  title: string;
  onBack: () => void;
};

export default function AuthHeader({ title, onBack }: Props) {
  return (
    <LinearGradient
      colors={[splashColors.gradientTop, splashColors.gradientBottom]}
      style={styles.header}
    >
      <View style={[styles.circle, styles.circleLarge]} />
      <View style={[styles.circle, styles.circleMedium]} />
      <View style={[styles.circle, styles.circleSmall]} />

      <Pressable
        style={styles.backButton}
        onPress={onBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Retour"
      >
        <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
      </Pressable>

      <Text style={styles.title}>{title}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 64,
    paddingBottom: 36,
    paddingHorizontal: 28,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circleLarge: {
    width: 160,
    height: 160,
    top: -50,
    right: -40,
  },
  circleMedium: {
    width: 70,
    height: 70,
    bottom: 10,
    right: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circleSmall: {
    width: 34,
    height: 34,
    bottom: 30,
    right: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginLeft: -8,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
