import React, { useState } from 'react';
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
const SIDE_PADDING = 20;
const GAP = 12;
const CARD_WIDTH = SCREEN_WIDTH - SIDE_PADDING * 2;
const STEP = CARD_WIDTH + GAP;

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
  const [index, setIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / STEP);
    setIndex((prev) => (prev === nextIndex ? prev : nextIndex));
  };

  if (cards.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={STEP}
        contentContainerStyle={styles.scrollContent}
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
  scrollContent: {
    paddingHorizontal: SIDE_PADDING,
    gap: GAP,
  },
  card: {
    width: CARD_WIDTH,
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
