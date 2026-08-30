export type BadgeKey = 'newMember' | 'goodCitizen' | 'engagedCitizen' | 'localHero' | 'legend';

type BadgeLevel = {
  key: BadgeKey;
  emoji: string;
  threshold: number;
};

export const BADGE_LEVELS: BadgeLevel[] = [
  { key: 'newMember', emoji: '🌱', threshold: 0 },
  { key: 'goodCitizen', emoji: '🤝', threshold: 1 },
  { key: 'engagedCitizen', emoji: '⭐', threshold: 5 },
  { key: 'localHero', emoji: '🏆', threshold: 15 },
  { key: 'legend', emoji: '👑', threshold: 50 },
];

export function getBadgeLevel(returnedCount: number) {
  let current = BADGE_LEVELS[0];
  let next: BadgeLevel | undefined = BADGE_LEVELS[1];

  for (let i = 0; i < BADGE_LEVELS.length; i += 1) {
    if (returnedCount >= BADGE_LEVELS[i].threshold) {
      current = BADGE_LEVELS[i];
      next = BADGE_LEVELS[i + 1];
    }
  }

  return { current, next, returnedCount };
}
