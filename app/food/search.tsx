import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, EmptyState } from '../../src/components/ui';
import { Food, FOOD_CATEGORY_LABEL, FoodCategory, FOODS } from '../../src/data/foods';
import { useApp } from '../../src/store/AppStore';
import { ROW, rtlText } from '../../src/theme/rtl';
import { colors, radius, spacing } from '../../src/theme/theme';
import { goBack } from '../../src/utils/nav';
import { toKey } from '../../src/utils/date';
import { macrosFor, MEAL_TYPES, MealType } from '../../src/utils/nutrition';

const CATEGORIES: (FoodCategory | 'all' | 'fav')[] = [
  'all',
  'fav',
  'protein',
  'carbs',
  'dairy',
  'israeli',
  'vegetables',
  'fruits',
  'fats',
  'snacks',
  'drinks',
];

export default function FoodSearch() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ meal?: MealType; date?: string }>();
  const { state, addMeal, toggleFavoriteFood } = useApp();

  const [meal, setMeal] = useState<MealType>(params.meal ?? 'breakfast');
  const [date] = useState(params.date ?? toKey());
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('all');
  const [selected, setSelected] = useState<Food | null>(null);
  const [grams, setGrams] = useState('100');
  const [manual, setManual] = useState(false);
  const [custom, setCustom] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FOODS.filter((f) => {
      if (category === 'fav' && !state.favoriteFoods.includes(f.id)) return false;
      if (category !== 'all' && category !== 'fav' && f.category !== category) return false;
      if (!q) return true;
      return f.name.toLowerCase().includes(q);
    });
  }, [query, category, state.favoriteFoods]);

  const gramsNum = Math.max(0, parseFloat(grams) || 0);
  const preview = selected ? macrosFor(selected, gramsNum) : null;

  const submitFood = () => {
    if (!selected || gramsNum <= 0) return;
    addMeal({ date, meal, food: selected, grams: gramsNum });
    goBack(router, '/(tabs)/nutrition');
  };

  const submitManual = () => {
    const calories = parseFloat(custom.calories) || 0;
    if (!custom.name.trim() || calories <= 0) return;
    addMeal({
      date,
      meal,
      grams: 0,
      customName: custom.name.trim(),
      customMacros: {
        calories,
        protein: parseFloat(custom.protein) || 0,
        carbs: parseFloat(custom.carbs) || 0,
        fat: parseFloat(custom.fat) || 0,
      },
    });
    goBack(router, '/(tabs)/nutrition');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { flexDirection: ROW }]}>
        <Pressable onPress={() => goBack(router, '/(tabs)/nutrition')} hitSlop={10} style={styles.headerBtn}>
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>הוספת מזון</Text>
        <Pressable onPress={() => setManual((m) => !m)} hitSlop={10} style={styles.headerBtn}>
          <Ionicons
            name={manual ? 'search' : 'create-outline'}
            size={20}
            color={colors.lime}
          />
        </Pressable>
      </View>

      {/* בחירת ארוחה */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: ROW,
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
        }}
        style={{ flexGrow: 0, flexShrink: 0 }}
      >
        {MEAL_TYPES.map((m) => (
          <Chip
            key={m.id}
            label={`${m.emoji} ${m.label}`}
            active={meal === m.id}
            onPress={() => setMeal(m.id)}
          />
        ))}
      </ScrollView>

      {manual ? (
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={{ gap: spacing.md }}>
            <Text style={[styles.sectionTitle, rtlText]}>הזנה ידנית</Text>
            <Field
              label="שם הפריט"
              value={custom.name}
              onChange={(v) => setCustom({ ...custom, name: v })}
              placeholder="לדוגמה: מנה במסעדה"
            />
            <View style={{ flexDirection: ROW, gap: spacing.md }}>
              <Field
                label="קלוריות"
                value={custom.calories}
                onChange={(v) => setCustom({ ...custom, calories: v })}
                numeric
                style={{ flex: 1 }}
              />
              <Field
                label="חלבון (ג')"
                value={custom.protein}
                onChange={(v) => setCustom({ ...custom, protein: v })}
                numeric
                style={{ flex: 1 }}
              />
            </View>
            <View style={{ flexDirection: ROW, gap: spacing.md }}>
              <Field
                label="פחמימות (ג')"
                value={custom.carbs}
                onChange={(v) => setCustom({ ...custom, carbs: v })}
                numeric
                style={{ flex: 1 }}
              />
              <Field
                label="שומן (ג')"
                value={custom.fat}
                onChange={(v) => setCustom({ ...custom, fat: v })}
                numeric
                style={{ flex: 1 }}
              />
            </View>
            <Button title="הוסף לארוחה" icon="add" onPress={submitManual} />
          </Card>
        </ScrollView>
      ) : (
        <>
          <View style={[styles.searchWrap, { flexDirection: ROW }]}>
            <Ionicons name="search" size={18} color={colors.textFaint} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="חפשו מזון..."
              placeholderTextColor={colors.textFaint}
              style={[styles.search, rtlText]}
            />
          </View>

          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(c) => c}
            showsHorizontalScrollIndicator={false}
            style={styles.chipStrip}
            contentContainerStyle={{
              flexDirection: ROW,
              gap: spacing.sm,
              paddingHorizontal: spacing.lg,
            }}
            renderItem={({ item }) => (
              <Chip
                label={
                  item === 'all'
                    ? 'הכול'
                    : item === 'fav'
                      ? '⭐ מועדפים'
                      : FOOD_CATEGORY_LABEL[item]
                }
                active={category === item}
                onPress={() => setCategory(item)}
              />
            )}
          />

          <FlatList
            data={results}
            keyExtractor={(f) => f.id}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: spacing.lg,
              gap: spacing.sm,
              paddingBottom: selected ? 260 : insets.bottom + spacing.xxl,
            }}
            ListEmptyComponent={
              <EmptyState
                icon="search-outline"
                title="לא נמצא מזון"
                text="אפשר להוסיף פריט ידנית בעזרת הכפתור למעלה."
              />
            }
            renderItem={({ item }) => {
              const fav = state.favoriteFoods.includes(item.id);
              const active = selected?.id === item.id;
              return (
                <Pressable
                  onPress={() => {
                    setSelected(item);
                    setGrams(String(item.servings[0]?.grams ?? 100));
                  }}
                  style={[styles.row, { flexDirection: ROW }, active && styles.rowActive]}
                >
                  <Text style={styles.emoji}>{item.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowName, rtlText]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.rowMeta, rtlText]}>
                      ל־100 ג': {item.per100.calories} קק"ל · {item.per100.protein} ג'
                      חלבון
                    </Text>
                  </View>
                  <Pressable onPress={() => toggleFavoriteFood(item.id)} hitSlop={8}>
                    <Ionicons
                      name={fav ? 'star' : 'star-outline'}
                      size={18}
                      color={fav ? colors.warn : colors.textFaint}
                    />
                  </Pressable>
                </Pressable>
              );
            }}
          />
        </>
      )}

      {/* חלונית כמות */}
      {selected && !manual ? (
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={{ flexDirection: ROW, alignItems: 'center', gap: spacing.sm }}>
            <Text style={styles.emoji}>{selected.emoji}</Text>
            <Text style={[styles.sheetTitle, rtlText]}>{selected.name}</Text>
            <View style={{ flex: 1 }} />
            <Pressable onPress={() => setSelected(null)} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.textFaint} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: ROW, gap: spacing.sm }}
          >
            {selected.servings.map((s) => (
              <Chip
                key={s.label}
                label={`${s.label} (${s.grams} ג')`}
                active={gramsNum === s.grams}
                onPress={() => setGrams(String(s.grams))}
              />
            ))}
          </ScrollView>

          <View style={{ flexDirection: ROW, alignItems: 'center', gap: spacing.md }}>
            <TextInput
              value={grams}
              onChangeText={(t) => setGrams(t.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              style={styles.gramsInput}
            />
            <Text style={styles.gramsLabel}>גרם</Text>
            <View style={{ flex: 1 }} />
            {preview ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.previewCals}>{preview.calories} קק"ל</Text>
                <Text style={styles.previewMacros}>
                  ח {preview.protein} · פ {preview.carbs} · ש {preview.fat}
                </Text>
              </View>
            ) : null}
          </View>

          <Button title="הוסף לארוחה" icon="add" onPress={submitFood} />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  numeric,
  style,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
  style?: object;
}) {
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text style={[styles.fieldLabel, rtlText]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(numeric ? t.replace(/[^0-9.]/g, '') : t)}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        style={[styles.fieldInput, rtlText]}
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
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  rowActive: { borderColor: colors.lime },
  emoji: { fontSize: 20 },
  rowName: { fontSize: 14, fontWeight: '800', color: colors.text },
  rowMeta: { fontSize: 11, color: colors.textFaint, marginTop: 2 },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sheetTitle: { fontSize: 16, fontWeight: '900', color: colors.text },
  gramsInput: {
    width: 90,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    paddingVertical: 10,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '900',
    color: colors.lime,
  },
  gramsLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  previewCals: { fontSize: 16, fontWeight: '900', color: colors.calories },
  previewMacros: { fontSize: 11, color: colors.textFaint, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  fieldInput: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
});
