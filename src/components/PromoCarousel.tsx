import React, { useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export type PromoCard = {
  key: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  body: string;
  colors: [string, string];
};

type Props = {
  cards: PromoCard[];
};

const SWIPE_THRESHOLD = 40;

export default function PromoCarousel({ cards }: Props) {
  const [index, setIndexState] = useState(0);
  const indexRef = useRef(0);
  const opacity = useRef(new Animated.Value(1)).current;

  const goTo = (updater: number | ((prev: number) => number)) => {
    const requested = typeof updater === 'function' ? (updater as (prev: number) => number)(indexRef.current) : updater;
    const clamped = Math.max(0, Math.min(cards.length - 1, requested));
    if (clamped === indexRef.current) return;
    indexRef.current = clamped;

    Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setIndexState(clamped);
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dx <= -SWIPE_THRESHOLD) {
          goTo((prev) => prev + 1);
        } else if (gesture.dx >= SWIPE_THRESHOLD) {
          goTo((prev) => prev - 1);
        }
      },
    })
  ).current;

  if (cards.length === 0) return null;
  const card = cards[index];

  return (
    <View style={styles.container}>
      <LinearGradient colors={card.colors} style={styles.card} {...panResponder.panHandlers}>
        <Animated.View style={{ opacity }}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name={card.icon} size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>{card.title}</Text>
          <Text style={styles.body}>{card.body}</Text>
        </Animated.View>
      </LinearGradient>

      {cards.length > 1 && (
        <View style={styles.dots}>
          {cards.map((c, dotIndex) => (
            <Pressable key={c.key} hitSlop={8} onPress={() => goTo(dotIndex)}>
              <View style={[styles.dot, dotIndex === index && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    minHeight: 130,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  body: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    lineHeight: 17,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D5DAE1',
  },
  dotActive: {
    width: 16,
    backgroundColor: '#2F6FED',
  },
});
