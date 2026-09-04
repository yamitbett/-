import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useApp } from '../src/store/AppStore';
import { colors } from '../src/theme/theme';

/** מסך פתיחה – מנתב לאונבורדינג או לאפליקציה לפי מצב המשתמש */
export default function Index() {
  const { state, hydrated } = useApp();

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.lime} size="large" />
      </View>
    );
  }

  return <Redirect href={state.profile.onboarded ? '/(tabs)/home' : '/onboarding'} />;
}
