import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { orbitPalette, splashColors } from '../theme/colors';

type OrbitItem = {
  key: keyof typeof orbitPalette;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  baseAngle: number;
};

const ORBIT_ITEMS: OrbitItem[] = [
  { key: 'key', icon: 'key-outline', baseAngle: 50 },
  { key: 'wallet', icon: 'wallet-outline', baseAngle: 140 },
  { key: 'bag', icon: 'bag-personal-outline', baseAngle: 230 },
  { key: 'glasses', icon: 'glasses', baseAngle: 320 },
];

const RING_SIZE = 240;
const ORBIT_RADIUS = 110;
const BUBBLE_SIZE = 56;
const ORBIT_DURATION_MS = 13000;
const PULSE_DURATION_MS = 1750;
const SPLASH_DURATION_MS = 5000;

type Props = {
  onFinished: () => void;
};

export default function SplashScreen({ onFinished }: Props) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const orbitValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      setReduceMotion(enabled);
    });

    const timer = setTimeout(onFinished, SPLASH_DURATION_MS);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      subscription.remove();
    };
  }, [onFinished]);

  useEffect(() => {
    if (reduceMotion) {
      orbitValue.stopAnimation();
      pulseValue.stopAnimation();
      orbitValue.setValue(0);
      pulseValue.setValue(0);
      return;
    }

    const orbitLoop = Animated.loop(
      Animated.timing(orbitValue, {
        toValue: 1,
        duration: ORBIT_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: PULSE_DURATION_MS / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0,
          duration: PULSE_DURATION_MS / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    orbitLoop.start();
    pulseLoop.start();

    return () => {
      orbitLoop.stop();
      pulseLoop.stop();
    };
  }, [reduceMotion, orbitValue, pulseValue]);

  const ringRotation = orbitValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseScale = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const pulseOpacity = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.85],
  });

  const items = useMemo(() => ORBIT_ITEMS, []);

  return (
    <LinearGradient
      colors={[splashColors.gradientTop, splashColors.gradientBottom]}
      style={styles.container}
    >
      <View style={styles.animationArea}>
        <View style={[styles.orbitGuide, styles.orbitGuideOuter]} />
        <View style={[styles.orbitGuide, styles.orbitGuideInner]} />

        <Animated.View
          style={[
            styles.orbitRing,
            !reduceMotion && { transform: [{ rotate: ringRotation }] },
          ]}
        >
          {items.map(({ key, icon, baseAngle }) => {
            const palette = orbitPalette[key];
            const counterRotation = orbitValue.interpolate({
              inputRange: [0, 1],
              outputRange: [`${-baseAngle}deg`, `${-baseAngle - 360}deg`],
            });

            return (
              <View
                key={key}
                style={[
                  styles.itemAnchor,
                  {
                    transform: [{ rotate: `${baseAngle}deg` }, { translateX: ORBIT_RADIUS }],
                  },
                ]}
              >
                <Animated.View
                  style={!reduceMotion && { transform: [{ rotate: counterRotation }] }}
                >
                  <View style={[styles.iconBubble, { backgroundColor: palette.background }]}>
                    <MaterialCommunityIcons name={icon} size={24} color={palette.icon} />
                  </View>
                </Animated.View>
              </View>
            );
          })}
        </Animated.View>

        <Animated.View
          style={[
            styles.searchBubble,
            !reduceMotion && { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
          ]}
        >
          <MaterialCommunityIcons name="magnify" size={44} color={splashColors.searchIcon} />
        </Animated.View>
      </View>

      <Text style={styles.title}>Findora</Text>
      <Text style={styles.slogan}>Ce qui est perdu finit par se retrouver</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationArea: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  orbitGuide: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: splashColors.ring,
  },
  orbitGuideOuter: {
    width: RING_SIZE,
    height: RING_SIZE,
  },
  orbitGuideInner: {
    width: RING_SIZE - 28,
    height: RING_SIZE - 28,
  },
  orbitRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
  },
  itemAnchor: {
    position: 'absolute',
    top: RING_SIZE / 2 - BUBBLE_SIZE / 2,
    left: RING_SIZE / 2 - BUBBLE_SIZE / 2,
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBubble: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: splashColors.searchBubble,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: splashColors.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    ...Platform.select({ android: { elevation: 20 } }),
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: splashColors.title,
    letterSpacing: 0.5,
  },
  slogan: {
    marginTop: 8,
    fontSize: 14,
    color: splashColors.slogan,
  },
});
