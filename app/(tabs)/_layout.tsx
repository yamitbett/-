import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { isRTL } from '../../src/theme/rtl';
import { colors } from '../../src/theme/theme';

const TABS: { name: string; title: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'home', title: 'בית', icon: 'home' },
  { name: 'workouts', title: 'אימונים', icon: 'barbell' },
  { name: 'nutrition', title: 'תזונה', icon: 'restaurant' },
  { name: 'progress', title: 'התקדמות', icon: 'stats-chart' },
  { name: 'profile', title: 'פרופיל', icon: 'person' },
];

export default function TabsLayout() {
  // סרגל הטאבים נבנה משמאל לימין על ידי הניווט, ולכן כשהמכשיר אינו במצב RTL
  // אנחנו הופכים את הסדר כדי ש"בית" יופיע בצד ימין כמקובל בעברית.
  const order = isRTL ? TABS : [...TABS].reverse();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: { paddingTop: 6 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      {order.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={t.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.bgElevated,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 66,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
  },
  label: { fontSize: 11, fontWeight: '700' },
});
