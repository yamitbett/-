import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, EmptyState } from '../../src/components/ui';
import { EXERCISES } from '../../src/data/exercises';
import {
  EQUIPMENT_LABEL,
  Exercise,
  MUSCLE_LABEL,
  MuscleGroup,
} from '../../src/data/types';
import { ROW, rtlText } from '../../src/theme/rtl';
import { colors, radius, spacing } from '../../src/theme/theme';
import { goBack } from '../../src/utils/nav';
import { demoThumb } from '../../src/utils/media';

const GROUPS: (MuscleGroup | 'all')[] = [
  'all',
  'chest',
  'back',
  'legs',
  'shoulders',
  'biceps',
  'triceps',
  'core',
  'cardio',
];

/**
 * מסך בחירת תרגיל – משמש גם כספריית תרגילים לעיון,
 * גם להוספת תרגיל לאימון וגם להחלפת תרגיל קיים.
 */
export default function ExercisePicker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    mode?: 'browse' | 'add' | 'replace';
    muscle?: MuscleGroup;
    sessionId?: string;
  }>();

  const mode = params.mode ?? 'browse';
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<MuscleGroup | 'all'>(
    mode === 'replace' && params.muscle ? params.muscle : 'all',
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      if (group !== 'all' && e.muscle !== group) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.nameEn.toLowerCase().includes(q) ||
        MUSCLE_LABEL[e.muscle].includes(q)
      );
    });
  }, [query, group]);

  const onPick = (e: Exercise) => {
    if (mode === 'browse') {
      router.push(`/exercise/${e.id}`);
      return;
    }
    // חוזרים למסך האימון הקיים ומעבירים לו את התרגיל שנבחר
    router.navigate({
      pathname: '/workout/[sessionId]',
      params: { sessionId: params.sessionId ?? '', added: e.id },
    });
  };

  const title =
    mode === 'replace'
      ? 'החלפת תרגיל'
      : mode === 'add'
        ? 'הוספת תרגיל'
        : 'ספריית תרגילים';

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
      <View style={[styles.header, { flexDirection: ROW }]}>
        <Pressable onPress={() => goBack(router, '/(tabs)/workouts')} hitSlop={10} style={styles.headerBtn}>
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={[styles.searchWrap, { flexDirection: ROW }]}>
        <Ionicons name="search" size={18} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="חפשו תרגיל..."
          placeholderTextColor={colors.textFaint}
          style={[styles.search, rtlText]}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textFaint} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={GROUPS}
        keyExtractor={(g) => g}
        showsHorizontalScrollIndicator={false}
        style={styles.chipStrip}
        contentContainerStyle={{
          flexDirection: ROW,
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
        }}
        renderItem={({ item }) => (
          <Chip
            label={item === 'all' ? 'הכול' : MUSCLE_LABEL[item]}
            active={group === item}
            onPress={() => setGroup(item)}
          />
        )}
      />

      <FlatList
        data={results}
        keyExtractor={(e) => e.id}
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: spacing.lg,
          gap: spacing.sm,
          paddingBottom: insets.bottom + spacing.xxl,
        }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="לא נמצאו תרגילים"
            text="נסו לחפש בשם אחר או לבחור קבוצת שרירים אחרת."
          />
        }
        renderItem={({ item }) => {
          const thumb = demoThumb(item.demoId);
          return (
            <Pressable
              onPress={() => onPick(item)}
              style={({ pressed }) => [
                styles.row,
                { flexDirection: ROW },
                pressed && { opacity: 0.75 },
              ]}
            >
              {thumb ? (
                <Image source={{ uri: thumb }} style={styles.thumb} contentFit="cover" />
              ) : (
                <View style={[styles.thumb, styles.thumbFallback]}>
                  <Ionicons name="barbell" size={20} color={colors.textFaint} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowName, rtlText]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.rowMeta, rtlText]} numberOfLines={1}>
                  {MUSCLE_LABEL[item.muscle]} · {EQUIPMENT_LABEL[item.equipment]} ·{' '}
                  {item.defaultSets}×{item.defaultReps}
                </Text>
              </View>
              <Ionicons
                name={mode === 'browse' ? 'chevron-back' : 'add-circle'}
                size={mode === 'browse' ? 18 : 24}
                color={mode === 'browse' ? colors.textFaint : colors.lime}
              />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '900', color: colors.text },
  chipStrip: { flexGrow: 0, flexShrink: 0, marginTop: spacing.md },
  searchWrap: {
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  search: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.text },
  row: {
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  thumb: { width: 52, height: 52, borderRadius: radius.sm, backgroundColor: colors.cardAlt },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  rowName: { fontSize: 15, fontWeight: '800', color: colors.text },
  rowMeta: { fontSize: 12, color: colors.textFaint, marginTop: 2, fontWeight: '600' },
});
