import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import BottomTabBar, { TabKey } from '../components/BottomTabBar';
import DashboardHomeScreen from './dashboard/DashboardHomeScreen';
import HistoryScreen from './dashboard/HistoryScreen';
import ComingSoonScreen from './dashboard/ComingSoonScreen';
import ProfileScreen from './dashboard/ProfileScreen';
import SettingsScreen from './SettingsScreen';

type Props = {
  onSignedOut: () => void;
};

export default function DashboardScreen({ onSignedOut }: Props) {
  const [tab, setTab] = useState<TabKey>('home');
  const [showSettings, setShowSettings] = useState(false);

  const handleChangeTab = (next: TabKey) => {
    setShowSettings(false);
    setTab(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {tab === 'home' && <DashboardHomeScreen onNavigate={handleChangeTab} />}
        {tab === 'history' && <HistoryScreen />}
        {tab === 'declare' && <ComingSoonScreen icon="plus-circle-outline" />}
        {tab === 'messages' && <ComingSoonScreen icon="message-text-outline" />}
        {tab === 'profile' &&
          (showSettings ? (
            <SettingsScreen onBack={() => setShowSettings(false)} />
          ) : (
            <ProfileScreen
              onNavigate={handleChangeTab}
              onOpenSettings={() => setShowSettings(true)}
              onSignedOut={onSignedOut}
            />
          ))}
      </View>

      <BottomTabBar active={tab} onChange={handleChangeTab} />
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
