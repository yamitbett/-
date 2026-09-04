import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { ExerciseDemo } from '../../src/components/ExerciseDemo';
import { LineChart } from '../../src/components/LineChart';
import { Badge, Button, Card, EmptyState } from '../../src/components/ui';
import { EXERCISE_BY_ID } from '../../src/data/exercises';
import { EQUIPMENT_LABEL, LEVEL_LABEL, MUSCLE_LABEL } from '../../src/data/types';
import { useApp } from '../../src/store/AppStore';
import { ROW, rtlText } from '../../src/theme/rtl';
import { colors, radius, spacing } from '../../src/theme/theme';
import { goBack } from '../../src/utils/nav';
import { shortDate } from '../../src/utils/date';
import { youtubeEmbedUrl, youtubeSearchUrl } from '../../src/utils/media';

type Tab = 'guide' | 'history';

export default function ExerciseDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; tab?: Tab }>();
  const { historyFor, personalRecord } = useApp();

  const [tab, setTab] = useState<Tab>(params.tab === 'history' ? 'history' : 'guide');
  const [chartWidth, setChartWidth] = useState(300);

  const exercise = EXERCISE_BY_ID[params.id ?? ''];

  if (!exercise) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 60 }]}>
        <EmptyState icon="alert-circle-outline" title="התרגיל לא נמצא" />
      </View>
    );
  }

  const history = historyFor(exercise.id);
  const pr = personalRecord(exercise.id);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      {/* מדיה */}
      <View>
        {exercise.youtubeId ? (
          <WebView
            source={{ uri: youtubeEmbedUrl(exercise.youtubeId) }}
            style={{ height: 240, backgroundColor: colors.cardAlt }}
            allowsFullscreenVideo
          />
        ) : (
          <ExerciseDemo exercise={exercise} height={260} rounded={0} />
        )}
        <Pressable
          onPress={() => goBack(router, '/(tabs)/workouts')}
          style={[styles.back, { top: insets.top + spacing.sm }]}
          hitSlop={10}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ gap: 8 }}>
          <Text style={[styles.name, rtlText]}>{exercise.name}</Text>
          <Text style={[styles.nameEn, rtlText]}>{exercise.nameEn}</Text>
          <View style={{ flexDirection: ROW, gap: spacing.sm, flexWrap: 'wrap' }}>
            <Badge label={MUSCLE_LABEL[exercise.muscle]} filled />
            <Badge label={EQUIPMENT_LABEL[exercise.equipment]} color={colors.info} />
            <Badge label={LEVEL_LABEL[exercise.level]} color={colors.purple} />
            {exercise.secondary.map((m) => (
              <Badge key={m} label={MUSCLE_LABEL[m]} color={colors.textFaint} />
            ))}
          </View>
        </View>

        <Button
          title="צפה בסרטוני הדגמה ביוטיוב"
          icon="logo-youtube"
          variant="secondary"
          onPress={() =>
            Linking.openURL(
              youtubeSearchUrl(`${exercise.name} טכניקה נכונה ${exercise.nameEn} form`),
            ).catch(() => {})
          }
        />

        {/* טאבים */}
        <View style={[styles.tabs, { flexDirection: ROW }]}>
          <TabBtn
            label="הסבר וטכניקה"
            active={tab === 'guide'}
            onPress={() => setTab('guide')}
          />
          <TabBtn
            label="ההיסטוריה שלי"
            active={tab === 'history'}
            onPress={() => setTab('history')}
          />
        </View>

        {tab === 'guide' ? (
          <View style={{ gap: spacing.lg }}>
            <Card style={{ gap: spacing.md }}>
              <Text style={[styles.sectionTitle, rtlText]}>איך מבצעים</Text>
              {exercise.steps.map((s, i) => (
                <View key={i} style={{ flexDirection: ROW, gap: spacing.md }}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, rtlText]}>{s}</Text>
                </View>
              ))}
            </Card>

            <Card style={{ gap: spacing.sm }}>
              <Text style={[styles.sectionTitle, rtlText]}>💡 טיפים</Text>
              {exercise.tips.map((t, i) => (
                <Text key={i} style={[styles.bullet, rtlText]}>
                  • {t}
                </Text>
              ))}
            </Card>

            <Card style={{ gap: spacing.sm }}>
              <Text style={[styles.sectionTitle, rtlText]}>⚠️ טעויות נפוצות</Text>
              {exercise.mistakes.map((t, i) => (
                <Text key={i} style={[styles.bullet, { color: colors.danger }, rtlText]}>
                  • {t}
                </Text>
              ))}
            </Card>

            <Card style={{ gap: spacing.md }}>
              <Text style={[styles.sectionTitle, rtlText]}>המלצת ביצוע</Text>
              <View style={{ flexDirection: ROW, gap: spacing.lg }}>
                <Recommend label="סטים" value={`${exercise.defaultSets}`} />
                <Recommend
                  label={exercise.timeBased ? 'זמן' : 'חזרות'}
                  value={exercise.defaultReps}
                />
                <Recommend label="מנוחה" value={`${exercise.rest} שנ'`} />
              </View>
            </Card>
          </View>
        ) : (
          <View style={{ gap: spacing.lg }}>
            {pr ? (
              <Card style={{ gap: 4 }}>
                <Text style={[styles.sectionTitle, rtlText]}>🏆 השיא שלך</Text>
                <Text style={styles.prValue}>
                  {pr.weight} ק"ג × {pr.reps} חזרות
                </Text>
              </Card>
            ) : null}

            {history.length >= 2 ? (
              <Card
                onLayout={(e) =>
                  setChartWidth(e.nativeEvent.layout.width - spacing.lg * 2)
                }
                style={{ gap: spacing.md }}
              >
                <Text style={[styles.sectionTitle, rtlText]}>התקדמות במשקל</Text>
                <LineChart
                  width={chartWidth}
                  points={history
                    .slice()
                    .reverse()
                    .map((h) => ({
                      label: shortDate(h.date),
                      value: h.best?.weight ?? 0,
                    }))}
                  suffix=' ק"ג'
                />
              </Card>
            ) : null}

            <Card style={{ gap: spacing.sm }}>
              <Text style={[styles.sectionTitle, rtlText]}>אימונים אחרונים</Text>
              {history.length === 0 ? (
                <EmptyState
                  icon="stats-chart-outline"
                  title="עוד לא ביצעת את התרגיל הזה"
                  text="ברגע שתסמנו סטים באימון, ההתקדמות תופיע כאן."
                />
              ) : (
                history.map((h, i) => (
                  <View key={i} style={[styles.histRow, { flexDirection: ROW }]}>
                    <Text style={styles.histDate}>{shortDate(h.date)}</Text>
                    <Text style={styles.histBest}>
                      {h.best ? `${h.best.weight} ק"ג × ${h.best.reps}` : '—'}
                    </Text>
                    <Text style={styles.histVol}>
                      {Math.round(h.volume).toLocaleString('he-IL')} ק"ג נפח
                    </Text>
                  </View>
                ))
              )}
            </Card>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function TabBtn({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabBtn, active && styles.tabBtnActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Recommend({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 3 }}>
      <Text style={styles.recValue}>{value}</Text>
      <Text style={styles.recLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  back: {
    position: 'absolute',
    right: spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 24, fontWeight: '900', color: colors.text },
  nameEn: { fontSize: 13, color: colors.textFaint, fontWeight: '600' },
  tabs: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.lime },
  tabText: { fontSize: 13, fontWeight: '800', color: colors.textMuted },
  tabTextActive: { color: '#0B0D0F' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.limeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontSize: 12, fontWeight: '900', color: colors.lime },
  stepText: { flex: 1, fontSize: 14, color: colors.textMuted, lineHeight: 21 },
  bullet: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  recValue: { fontSize: 16, fontWeight: '900', color: colors.lime },
  recLabel: { fontSize: 11, fontWeight: '700', color: colors.textFaint },
  prValue: { fontSize: 22, fontWeight: '900', color: colors.lime, textAlign: 'right' },
  histRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  histDate: { fontSize: 13, fontWeight: '800', color: colors.text, width: 50 },
  histBest: { fontSize: 13, fontWeight: '700', color: colors.lime },
  histVol: { fontSize: 12, color: colors.textFaint, fontWeight: '600' },
});
