import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Button, Card, Chip, SectionHeader } from '../../src/components/ui';
import { EXERCISE_BY_ID } from '../../src/data/exercises';
import { GOAL_LABEL, Program, PROGRAMS } from '../../src/data/programs';
import { LEVEL_LABEL } from '../../src/data/types';
import { useApp } from '../../src/store/AppStore';
import { ROW, rtlText } from '../../src/theme/rtl';
import { colors, radius, spacing } from '../../src/theme/theme';
import { demoThumb } from '../../src/utils/media';

const FILTERS = [
  { id: 'all', label: 'הכול' },
  { id: 'beginner', label: 'מתחילים' },
  { id: 'muscle', label: 'בניית מסה' },
  { id: 'fat_loss', label: 'חיטוב' },
] as const;

export default function WorkoutsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, updateProfile, startWorkout, startEmptyWorkout, activeSession } =
    useApp();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');

  const current = state.profile.programId;
  const list = PROGRAMS.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'beginner') return p.level === 'beginner';
    return p.goal === filter;
  });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.h1, rtlText]}>אימונים</Text>
      <Text style={[styles.sub, rtlText]}>
        בחרו תוכנית מובנית או בנו אימון משלכם
      </Text>

      <View style={{ flexDirection: ROW, gap: spacing.md, marginTop: spacing.lg }}>
        <Button
          title={activeSession ? 'המשך אימון פעיל' : 'אימון חופשי'}
          icon={activeSession ? 'play' : 'add'}
          style={{ flex: 1 }}
          onPress={() => {
            if (activeSession) {
              router.push(`/workout/${activeSession.id}`);
              return;
            }
            const s = startEmptyWorkout();
            router.push(`/workout/${s.id}`);
          }}
        />
        <Button
          title="ספריית תרגילים"
          icon="search"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => router.push('/exercise/picker?mode=browse')}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: spacing.lg }}
        contentContainerStyle={{ flexDirection: ROW, gap: spacing.sm }}
      >
        {FILTERS.map((f) => (
          <Chip
            key={f.id}
            label={f.label}
            active={filter === f.id}
            onPress={() => setFilter(f.id)}
          />
        ))}
      </ScrollView>

      <SectionHeader title="תוכניות אימון" />

      <View style={{ gap: spacing.md }}>
        {list.map((p) => (
          <ProgramCard
            key={p.id}
            program={p}
            selected={current === p.id}
            onSelect={() => updateProfile({ programId: p.id })}
            onOpen={() => router.push(`/program/${p.id}`)}
            onStartDay={(dayId) => {
              const s = startWorkout(p.id, dayId);
              router.push(`/workout/${s.id}`);
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function ProgramCard({
  program,
  selected,
  onSelect,
  onOpen,
  onStartDay,
}: {
  program: Program;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onStartDay: (dayId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const firstEx = program.days[0]?.exercises[0]?.exerciseId;
  const thumb = firstEx ? demoThumb(EXERCISE_BY_ID[firstEx]?.demoId ?? null) : null;

  return (
    <Card style={[styles.programCard, selected && styles.programCardActive]}>
      <Pressable onPress={onOpen}>
        <View style={{ flexDirection: ROW, gap: spacing.md, alignItems: 'center' }}>
          {thumb ? (
            <Image source={{ uri: thumb }} style={styles.thumb} contentFit="cover" />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]}>
              <Ionicons name="barbell" size={22} color={colors.textFaint} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: ROW, alignItems: 'center', gap: 8 }}>
              <Text style={[styles.programName, rtlText]} numberOfLines={1}>
                {program.name}
              </Text>
              {selected ? <Badge label="פעילה" filled /> : null}
            </View>
            <Text style={[styles.programMeta, rtlText]}>
              {program.daysPerWeek} אימונים בשבוע · {LEVEL_LABEL[program.level]} ·{' '}
              {GOAL_LABEL[program.goal]}
            </Text>
          </View>
        </View>

        <Text style={[styles.programDesc, rtlText]}>{program.description}</Text>
      </Pressable>

      <Pressable
        onPress={() => setExpanded((e) => !e)}
        style={{ flexDirection: ROW, alignItems: 'center', gap: 6, paddingVertical: 4 }}
      >
        <Text style={styles.expandText}>
          {expanded ? 'הסתר אימונים' : `הצג ${program.days.length} אימונים`}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={15}
          color={colors.lime}
        />
      </Pressable>

      {expanded ? (
        <View style={{ gap: spacing.sm }}>
          {program.days.map((d) => (
            <Pressable
              key={d.id}
              onPress={() => onStartDay(d.id)}
              style={({ pressed }) => [styles.dayRow, pressed && { opacity: 0.75 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.dayName, rtlText]}>{d.name}</Text>
                <Text style={[styles.daySub, rtlText]}>
                  {d.subtitle} · {d.exercises.length} תרגילים · ~{d.estimatedMinutes} דק'
                </Text>
              </View>
              <View style={styles.playBtn}>
                <Ionicons name="play" size={14} color="#0B0D0F" />
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      {!selected ? (
        <Button
          title="הפוך לתוכנית שלי"
          variant="secondary"
          icon="checkmark-circle-outline"
          onPress={onSelect}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg },
  h1: { fontSize: 28, fontWeight: '900', color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  programCard: { gap: spacing.md },
  programCardActive: { borderColor: colors.lime, borderWidth: 1.5 },
  thumb: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.cardAlt },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  programName: { fontSize: 17, fontWeight: '800', color: colors.text, flexShrink: 1 },
  programMeta: { fontSize: 12, color: colors.textFaint, marginTop: 3, fontWeight: '600' },
  programDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  expandText: { fontSize: 13, fontWeight: '800', color: colors.lime },
  dayRow: {
    flexDirection: ROW,
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  dayName: { fontSize: 15, fontWeight: '800', color: colors.text, textAlign: 'right' },
  daySub: { fontSize: 12, color: colors.textFaint, marginTop: 2, textAlign: 'right' },
  playBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
