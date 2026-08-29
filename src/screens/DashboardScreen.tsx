import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import BottomTabBar, { TabKey } from '../components/BottomTabBar';
import DashboardHomeScreen from './dashboard/DashboardHomeScreen';
import ComingSoonScreen from './dashboard/ComingSoonScreen';
import ProfileScreen from './dashboard/ProfileScreen';

type Props = {
  onSignedOut: () => void;
};

export default function DashboardScreen({ onSignedOut }: Props) {
  const [tab, setTab] = useState<TabKey>('home');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {tab === 'home' && <DashboardHomeScreen onNavigate={setTab} />}
        {tab === 'search' && <ComingSoonScreen icon="magnify" />}
        {tab === 'declare' && <ComingSoonScreen icon="plus-circle-outline" />}
        {tab === 'messages' && <ComingSoonScreen icon="message-text-outline" />}
        {tab === 'profile' && <ProfileScreen onSignedOut={onSignedOut} />}
      </View>

      <BottomTabBar active={tab} onChange={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
