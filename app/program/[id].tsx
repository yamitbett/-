import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Button, Card, EmptyState } from '../../src/components/ui';
import { EXERCISE_BY_ID } from '../../src/data/exercises';
import { GOAL_LABEL, PROGRAM_BY_ID } from '../../src/data/programs';
import { LEVEL_LABEL, MUSCLE_LABEL } from '../../src/data/types';
import { useApp } from '../../src/store/AppStore';
import { ROW, rtlText } from '../../src/theme/rtl';
import { colors, radius, spacing } from '../../src/theme/theme';
import { goBack } from '../../src/utils/nav';
import { demoThumb } from '../../src/utils/media';

export default function ProgramDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, updateProfile, startWorkout } = useApp();

  const program = PROGRAM_BY_ID[id ?? ''];
  if (!program) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 60 }]}>
        <EmptyState icon="alert-circle-outline" title="התוכנית לא נמצאה" />
      </View>
    );
  }

  const isActive = state.profile.programId === program.id;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingBottom: insets.bottom + spacing.xxl,
        gap: spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: ROW, alignItems: 'center' }}>
        <Pressable onPress={() => goBack(router, '/(tabs)/workouts')} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }} />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={[styles.title, rtlText]}>{program.name}</Text>
        <View style={{ flexDirection: ROW, gap: spacing.sm, flexWrap: 'wrap' }}>
          <Badge label={`${program.daysPerWeek} בשבוע`} filled />
          <Badge label={LEVEL_LABEL[program.level]} color={colors.info} />
          <Badge label={GOAL_LABEL[program.goal]} color={colors.purple} />
        </View>
        <Text style={[styles.desc, rtlText]}>{program.description}</Text>
      </View>

      {!isActive ? (
        <Button
          title="הפוך לתוכנית שלי"
          icon="checkmark-circle-outline"
          onPress={() => updateProfile({ programId: program.id })}
        />
      ) : (
        <Card style={{ flexDirection: ROW, alignItems: 'center', gap: spacing.md }}>
          <Ionicons name="checkmark-circle" size={20} color={colors.lime} />
          <Text style={[styles.activeText, rtlText]}>זו התוכנית הפעילה שלך</Text>
        </Card>
      )}

      {program.days.map((day) => (
        <Card key={day.id} style={{ gap: spacing.md }}>
          <View style={{ flexDirection: ROW, alignItems: 'center', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dayName, rtlText]}>{day.name}</Text>
              <Text style={[styles.daySub, rtlText]}>{day.subtitle}</Text>
            </View>
            <Pressable
              onPress={() => {
                const s = startWorkout(program.id, day.id);
                router.push(`/workout/${s.id}`);
              }}
              style={styles.startBtn}
            >
              <Ionicons name="play" size={14} color="#0B0D0F" />
              <Text style={styles.startText}>התחל</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: ROW, gap: spacing.sm, flexWrap: 'wrap' }}>
            {day.focus.map((f) => (
              <Badge key={f} label={MUSCLE_LABEL[f]} color={colors.textFaint} />
            ))}
          </View>

          <View style={{ gap: spacing.sm }}>
            {day.exercises.map((pe) => {
              const meta = EXERCISE_BY_ID[pe.exerciseId];
              const thumb = demoThumb(meta?.demoId ?? null);
              return (
                <Pressable
                  key={pe.exerciseId}
                  onPress={() => router.push(`/exercise/${pe.exerciseId}`)}
                  style={({ pressed }) => [
                    styles.exRow,
                    { flexDirection: ROW },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  {thumb ? (
                    <Image source={{ uri: thumb }} style={styles.thumb} contentFit="cover" />
                  ) : (
                    <View style={[styles.thumb, styles.thumbFallback]}>
                      <Ionicons name="barbell" size={16} color={colors.textFaint} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.exName, rtlText]} numberOfLines={1}>
                      {meta?.name ?? pe.exerciseId}
                    </Text>
                    <Text style={[styles.exMeta, rtlText]}>
                      {pe.sets} סטים × {pe.reps} · מנוחה {pe.restSeconds} שנ'
                    </Text>
                  </View>
                  <Ionicons name="chevron-back" size={16} color={colors.textFaint} />
                </Pressable>
              );
            })}
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  desc: { fontSize: 13, color: colors.textMuted, lineHeight: 21 },
  activeText: { fontSize: 14, fontWeight: '800', color: colors.lime },
  dayName: { fontSize: 18, fontWeight: '900', color: colors.text },
  daySub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.lime,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  startText: { fontSize: 13, fontWeight: '900', color: '#0B0D0F' },
  exRow: {
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  thumb: { width: 42, height: 42, borderRadius: radius.sm, backgroundColor: colors.cardAlt },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  exName: { fontSize: 14, fontWeight: '700', color: colors.text },
  exMeta: { fontSize: 11, color: colors.textFaint, marginTop: 2 },
});
