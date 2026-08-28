import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type DoorPhase = 'idle' | 'checking' | 'success' | 'error';

type Props = {
  phase: DoorPhase;
  onPhaseComplete?: () => void;
};

const WALK_DISTANCE = 64;

export default function DoorLoginAnimation({ phase, onPhaseComplete }: Props) {
  const characterX = useRef(new Animated.Value(0)).current;
  const characterOpacity = useRef(new Animated.Value(1)).current;
  const doorOpenAnim = useRef(new Animated.Value(0)).current;
  const crossOpacity = useRef(new Animated.Value(0)).current;
  const crossScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let completeTimer: ReturnType<typeof setTimeout> | undefined;

    if (phase === 'checking') {
      characterX.setValue(0);
      characterOpacity.setValue(1);
      doorOpenAnim.setValue(0);
      crossOpacity.setValue(0);
      crossScale.setValue(0.5);

      Animated.parallel([
        Animated.timing(doorOpenAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(characterX, {
          toValue: WALK_DISTANCE * 0.55,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    }

    if (phase === 'success') {
      Animated.sequence([
        Animated.timing(characterX, {
          toValue: WALK_DISTANCE,
          duration: 320,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(characterOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: false,
        }),
      ]).start();

      completeTimer = setTimeout(() => onPhaseComplete?.(), 850);
    }

    if (phase === 'error') {
      Animated.sequence([
        Animated.timing(characterX, {
          toValue: WALK_DISTANCE * 0.75,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.spring(characterX, {
          toValue: WALK_DISTANCE * 0.4,
          friction: 4,
          tension: 60,
          useNativeDriver: false,
        }),
      ]).start();

      Animated.sequence([
        Animated.delay(150),
        Animated.parallel([
          Animated.timing(crossOpacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: false,
          }),
          Animated.timing(crossScale, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: false,
          }),
        ]),
      ]).start();

      completeTimer = setTimeout(() => onPhaseComplete?.(), 1600);
    }

    if (phase === 'idle') {
      characterX.setValue(0);
      characterOpacity.setValue(1);
      doorOpenAnim.setValue(0);
      crossOpacity.setValue(0);
      crossScale.setValue(0.5);
    }

    return () => {
      if (completeTimer) clearTimeout(completeTimer);
    };
  }, [phase]);

  const doorClosedOpacity = doorOpenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const doorOpenOpacity = doorOpenAnim;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.character,
          { transform: [{ translateX: characterX }], opacity: characterOpacity },
        ]}
      >
        <MaterialCommunityIcons name="walk" size={26} color="#FFFFFF" />

        {phase === 'error' && (
          <Animated.View
            style={[
              styles.cross,
              { opacity: crossOpacity, transform: [{ scale: crossScale }] },
            ]}
          >
            <MaterialCommunityIcons name="close-circle" size={20} color="#FF5C5C" />
          </Animated.View>
        )}
      </Animated.View>

      <View style={styles.doorFrame}>
        <Animated.View style={[styles.doorIcon, { opacity: doorClosedOpacity }]}>
          <MaterialCommunityIcons name="door" size={30} color="#FFFFFF" />
        </Animated.View>
        <Animated.View style={[styles.doorIcon, styles.doorIconOverlay, { opacity: doorOpenOpacity }]}>
          <MaterialCommunityIcons name="door-open" size={30} color="#FFFFFF" />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: WALK_DISTANCE + 40,
    height: 34,
  },
  character: {
    position: 'absolute',
    left: 0,
  },
  doorFrame: {
    position: 'absolute',
    right: 0,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doorIcon: {
    position: 'absolute',
  },
  doorIconOverlay: {},
  cross: {
    position: 'absolute',
    top: -16,
    left: 3,
  },
});
