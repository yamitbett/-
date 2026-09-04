import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MacroBar, MacroRing } from '../../src/components/MacroRing';
import { Card, EmptyState } from '../../src/components/ui';
import { useApp } from '../../src/store/AppStore';
import { ROW, ROW_LTR, rtlText } from '../../src/theme/rtl';
import { colors, radius, spacing } from '../../src/theme/theme';
import { DAY_NAMES, humanDate, lastNDays, toKey } from '../../src/utils/date';
import { MEAL_TYPES, sumMacros } from '../../src/utils/nutrition';

export default function NutritionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, mealsFor, macrosFor, removeMeal } = useApp();

  const [date, setDate] = useState(toKey());
  const meals = mealsFor(date);
  const eaten = macrosFor(date);
  const targets = state.profile.targets;
  const left = Math.max(0, targets.calories - eaten.calories);

  const strip = useMemo(() => lastNDays(7), []);

  const byMeal = useMemo(
    () =>
      MEAL_TYPES.map((m) => {
        const items = meals.filter((x) => x.meal === m.id);
        return { ...m, items, macros: sumMacros(items.map((i) => i.macros)) };
      }),
    [meals],
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.h1, rtlText]}>תזונה</Text>

      {/* רצועת תאריכים */}
      {/* ציר זמן: הישן משמאל והיום מימין */}
      <View style={[styles.strip, { flexDirection: ROW_LTR }]}>
        {strip.map((d) => {
          const active = d === date;
          const dt = new Date(d);
          return (
            <Pressable
              key={d}
              onPress={() => setDate(d)}
              style={[styles.stripDay, active && styles.stripDayActive]}
            >
              <Text style={[styles.stripName, active && styles.stripTextActive]}>
                {DAY_NAMES[dt.getDay()]}
              </Text>
              <Text style={[styles.stripNum, active && styles.stripTextActive]}>
                {dt.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.dateLabel, rtlText]}>{humanDate(date)}</Text>

      {/* סיכום מאקרו */}
      <Card style={{ gap: spacing.lg, marginTop: spacing.md }}>
        <View style={{ flexDirection: ROW, alignItems: 'center', gap: spacing.lg }}>
          <MacroRing
            value={eaten.calories}
            target={targets.calories}
            label="קלוריות"
            sublabel={`נותרו ${left}`}
            size={126}
            color={colors.calories}
          />
          <View style={{ flex: 1, gap: spacing.md }}>
            <MacroBar
              label="חלבון"
              value={eaten.protein}
              target={targets.protein}
              color={colors.protein}
            />
            <MacroBar
              label="פחמימות"
              value={eaten.carbs}
              target={targets.carbs}
              color={colors.carbs}
            />
            <MacroBar
              label="שומן"
              value={eaten.fat}
              target={targets.fat}
              color={colors.fat}
            />
          </View>
        </View>
      </Card>

      {/* ארוחות */}
      <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
        {byMeal.map((m) => (
          <Card key={m.id} style={{ gap: spacing.md }}>
            <View
              style={{
                flexDirection: ROW,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: ROW, alignItems: 'center', gap: spacing.sm }}>
                <Text style={styles.mealEmoji}>{m.emoji}</Text>
                <View>
                  <Text style={[styles.mealName, rtlText]}>{m.label}</Text>
                  <Text style={[styles.mealMacros, rtlText]}>
                    {Math.round(m.macros.calories)} קק"ל · ח {Math.round(m.macros.protein)} ·
                    פ {Math.round(m.macros.carbs)} · ש {Math.round(m.macros.fat)}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.push(`/food/search?meal=${m.id}&date=${date}`)}
                hitSlop={8}
                style={styles.addBtn}
              >
                <Ionicons name="add" size={20} color="#0B0D0F" />
              </Pressable>
            </View>

            {m.items.length === 0 ? (
              <Text style={[styles.emptyMeal, rtlText]}>עוד לא הוספת פריטים</Text>
            ) : (
              <View style={{ gap: 6 }}>
                {m.items.map((item) => (
                  <View
                    key={item.id}
                    style={[styles.foodRow, { flexDirection: ROW }]}
                  >
                    <Text style={styles.foodEmoji}>{item.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.foodName, rtlText]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.foodMeta, rtlText]}>
                        {item.grams} גרם · {Math.round(item.macros.protein)} ג' חלבון
                      </Text>
                    </View>
                    <Text style={styles.foodCals}>
                      {Math.round(item.macros.calories)}
                    </Text>
                    <Pressable onPress={() => removeMeal(item.id)} hitSlop={8}>
                      <Ionicons name="close" size={16} color={colors.textFaint} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </Card>
        ))}
      </View>

      {meals.length === 0 ? (
        <Card style={{ marginTop: spacing.lg }}>
          <EmptyState
            icon="restaurant-outline"
            title="היום עוד ריק"
            text="הקישו על הפלוס ליד כל ארוחה כדי להוסיף מזון מהמאגר או להזין ערכים ידנית."
          />
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  h1: { fontSize: 28, fontWeight: '900', color: colors.text },
  strip: {
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: 6,
  },
  stripDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    gap: 2,
  },
  stripDayActive: { backgroundColor: colors.lime },
  stripName: { fontSize: 11, fontWeight: '700', color: colors.textFaint },
  stripNum: { fontSize: 15, fontWeight: '900', color: colors.text },
  stripTextActive: { color: '#0B0D0F' },
  dateLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  mealEmoji: { fontSize: 22 },
  mealName: { fontSize: 15, fontWeight: '800', color: colors.text },
  mealMacros: { fontSize: 11, color: colors.textFaint, marginTop: 2, fontWeight: '600' },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMeal: { fontSize: 12, color: colors.textFaint },
  foodRow: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  foodEmoji: { fontSize: 16 },
  foodName: { fontSize: 13, fontWeight: '700', color: colors.text },
  foodMeta: { fontSize: 11, color: colors.textFaint, marginTop: 1 },
  foodCals: { fontSize: 14, fontWeight: '900', color: colors.calories },
});
