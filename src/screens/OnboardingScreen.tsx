import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { splashColors } from '../theme/colors';

const findoraLogo = require('../../assets/findora-logo.png');

type Slide = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    icon: 'magnify',
    title: 'Bienvenue sur\nFindora',
    subtitle: 'VOTRE ALLIÉ RETROUVAILLES',
    description:
      "L'application qui relie les personnes ayant perdu un objet à celles qui l'ont trouvé, partout dans le monde.",
  },
  {
    icon: 'camera-plus-outline',
    title: 'Déclarez en\nquelques secondes',
    subtitle: 'PERDU OU TROUVÉ',
    description:
      'Ajoutez une photo, une catégorie et un lieu. Que vous ayez perdu ou trouvé un objet, c’est aussi simple.',
  },
  {
    icon: 'radar',
    title: 'Un matching\nautomatique',
    subtitle: 'ON S’OCCUPE DU RESTE',
    description:
      'Notre moteur compare en continu les objets perdus et trouvés pour vous proposer les bonnes correspondances.',
  },
  {
    icon: 'shield-check-outline',
    title: 'Échangez en\ntoute sécurité',
    subtitle: 'VÉRIFICATION ET MESSAGERIE',
    description:
      'Une vérification anti-fraude et une messagerie interne pour récupérer votre bien sans jamais partager vos coordonnées.',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  onSkip: () => void;
  onFinish: () => void;
};

export default function OnboardingScreen({ onSkip, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isLast = index === SLIDES.length - 1;

  const goToIndex = (nextIndex: number) => {
    scrollRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
    setIndex(nextIndex);
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setIndex(nextIndex);
  };

  const handleNext = () => {
    if (isLast) {
      onFinish();
      return;
    }
    goToIndex(index + 1);
  };

  return (
    <LinearGradient
      colors={[splashColors.gradientTop, splashColors.gradientBottom]}
      style={styles.flex}
    >
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Image source={findoraLogo} style={styles.logoBadge} resizeMode="contain" />
          <Text style={styles.logoText}>Findora</Text>
        </View>

        <Pressable onPress={onSkip} hitSlop={8}>
          <Text style={styles.skipText}>Passer</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.flex}
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={styles.slide}>
            <View style={styles.watermarkRing} />

            <View style={styles.iconBubble}>
              <MaterialCommunityIcons name={slide.icon} size={40} color={splashColors.title} />
            </View>

            <Text style={styles.title}>{slide.title}</Text>
            <View style={styles.divider} />
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {SLIDES.map((slide, dotIndex) => (
          <Pressable key={slide.title} onPress={() => goToIndex(dotIndex)} hitSlop={6}>
            <View style={[styles.dot, dotIndex === index && styles.dotActive]} />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.ctaButton} onPress={handleNext}>
        <Text style={styles.ctaText}>{isLast ? 'Commencer' : 'Suivant'}</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color={splashColors.searchIcon} />
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.select({ web: 20, default: 60 }),
    paddingHorizontal: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 28,
    height: 28,
  },
  logoText: {
    fontSize: 15,
    fontWeight: '700',
    color: splashColors.title,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 56,
  },
  watermarkRing: {
    position: 'absolute',
    top: 40,
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconBubble: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    color: splashColors.title,
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginTop: 20,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '700',
    letterSpacing: 1.5,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    width: 22,
    backgroundColor: splashColors.title,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 56,
    borderRadius: 999,
    backgroundColor: splashColors.searchBubble,
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: Platform.select({ ios: 48, default: 32 }),
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: splashColors.searchIcon,
  },
});
