import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const AUTO_ADVANCE_MS = 3000;

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

export default function PromoCarousel({ cards }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const isUserScrolling = useRef(false);

  useEffect(() => {
    if (cards.length < 2) return undefined;

    const timer = setInterval(() => {
      if (isUserScrolling.current) return;
      setIndex((prev) => {
        const next = (prev + 1) % cards.length;
        scrollRef.current?.scrollTo({ x: next * CARD_WIDTH, animated: true });
        return next;
      });
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [cards.length]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isUserScrolling.current = false;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
    setIndex(nextIndex);
  };

  if (cards.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => {
          isUserScrolling.current = true;
        }}
        onMomentumScrollEnd={handleScrollEnd}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH}
      >
        {cards.map((card) => (
          <LinearGradient key={card.key} colors={card.colors} style={styles.card}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name={card.icon} size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>{card.title}</Text>
            <Text style={styles.body}>{card.body}</Text>
          </LinearGradient>
        ))}
      </ScrollView>

      {cards.length > 1 && (
        <View style={styles.dots}>
          {cards.map((card, dotIndex) => (
            <View key={card.key} style={[styles.dot, dotIndex === index && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  card: {
    width: CARD_WIDTH,
    marginLeft: 20,
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
