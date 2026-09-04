import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, SectionHeader } from '../../src/components/ui';
import { PROGRAM_BY_ID } from '../../src/data/programs';
import { useApp } from '../../src/store/AppStore';
import { ROW, rtlText } from '../../src/theme/rtl';
import { colors, radius, spacing } from '../../src/theme/theme';
import { ACTIVITY_LEVELS, GOAL_OPTIONS } from '../../src/utils/nutrition';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, updateProfile, recalcTargets, resetAll } = useApp();
  const p = state.profile;
  const program = p.programId ? PROGRAM_BY_ID[p.programId] : null;

  const [editingTargets, setEditingTargets] = useState(false);

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
      <Text style={[styles.h1, rtlText]}>הפרופיל שלי</Text>

      {/* פרטים אישיים */}
      <SectionHeader title="פרטים אישיים" />
      <Card style={{ gap: spacing.md }}>
        <Field
          label="שם"
          value={p.name}
          onChange={(v) => updateProfile({ name: v })}
          placeholder="איך קוראים לך?"
        />
        <View style={{ flexDirection: ROW, gap: spacing.md }}>
          <Field
            label="גיל"
            value={String(p.age)}
            numeric
            style={{ flex: 1 }}
            onChange={(v) => updateProfile({ age: clamp(parseInt(v, 10) || 0, 10, 100) })}
          />
          <Field
            label="גובה (ס״מ)"
            value={String(p.heightCm)}
            numeric
            style={{ flex: 1 }}
            onChange={(v) =>
              updateProfile({ heightCm: clamp(parseInt(v, 10) || 0, 100, 250) })
            }
          />
          <Field
            label="משקל (ק״ג)"
            value={String(p.weightKg)}
            numeric
            style={{ flex: 1 }}
            onChange={(v) =>
              updateProfile({ weightKg: clamp(parseFloat(v) || 0, 25, 300) })
            }
          />
        </View>

        <Text style={[styles.label, rtlText]}>מין</Text>
        <View style={{ flexDirection: ROW, gap: spacing.sm }}>
          <Chip
            label="גבר"
            active={p.gender === 'male'}
            onPress={() => updateProfile({ gender: 'male' })}
          />
          <Chip
            label="אישה"
            active={p.gender === 'female'}
            onPress={() => updateProfile({ gender: 'female' })}
          />
          <Chip
            label="אחר"
            active={p.gender === 'other'}
            onPress={() => updateProfile({ gender: 'other' })}
          />
        </View>
      </Card>

      {/* מטרה ורמת פעילות */}
      <SectionHeader title="מטרה ורמת פעילות" />
      <Card style={{ gap: spacing.md }}>
        <Text style={[styles.label, rtlText]}>המטרה שלי</Text>
        <View style={{ flexDirection: ROW, gap: spacing.sm, flexWrap: 'wrap' }}>
          {GOAL_OPTIONS.map((g) => (
            <Chip
              key={g.value}
              label={`${g.emoji} ${g.label}`}
              active={p.goal === g.value}
              onPress={() => updateProfile({ goal: g.value })}
            />
          ))}
        </View>

        <Text style={[styles.label, rtlText, { marginTop: spacing.sm }]}>
          רמת פעילות
        </Text>
        <View style={{ gap: spacing.sm }}>
          {ACTIVITY_LEVELS.map((a) => (
            <Pressable
              key={a.value}
              onPress={() => updateProfile({ activity: a.value })}
              style={[
                styles.activityRow,
                { flexDirection: ROW },
                p.activity === a.value && styles.activityRowActive,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.activityLabel, rtlText]}>{a.label}</Text>
                <Text style={[styles.activityHint, rtlText]}>{a.hint}</Text>
              </View>
              <Ionicons
                name={p.activity === a.value ? 'radio-button-on' : 'radio-button-off'}
                size={19}
                color={p.activity === a.value ? colors.lime : colors.textFaint}
              />
            </Pressable>
          ))}
        </View>
      </Card>

      {/* יעדים תזונתיים */}
      <SectionHeader title="יעדים תזונתיים" />
      <Card style={{ gap: spacing.md }}>
        <View
          style={{
            flexDirection: ROW,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, rtlText]}>חישוב אוטומטי</Text>
            <Text style={[styles.hint, rtlText]}>
              היעדים מחושבים לפי גיל, משקל, גובה, מין ורמת פעילות (נוסחת
              Mifflin-St Jeor).
            </Text>
          </View>
          <Switch
            value={p.autoTargets}
            onValueChange={(v) => {
              updateProfile({ autoTargets: v });
              if (v) recalcTargets({ autoTargets: true });
            }}
            trackColor={{ true: colors.limeDim, false: colors.cardAlt }}
            thumbColor={p.autoTargets ? colors.lime : colors.textFaint}
          />
        </View>

        <View style={{ flexDirection: ROW, gap: spacing.md }}>
          <TargetBox
            label="קלוריות"
            value={p.targets.calories}
            color={colors.calories}
            editable={editingTargets && !p.autoTargets}
            onChange={(n) => updateProfile({ targets: { ...p.targets, calories: n } })}
          />
          <TargetBox
            label="חלבון"
            value={p.targets.protein}
            color={colors.protein}
            editable={editingTargets && !p.autoTargets}
            onChange={(n) => updateProfile({ targets: { ...p.targets, protein: n } })}
          />
          <TargetBox
            label="פחמימות"
            value={p.targets.carbs}
            color={colors.carbs}
            editable={editingTargets && !p.autoTargets}
            onChange={(n) => updateProfile({ targets: { ...p.targets, carbs: n } })}
          />
          <TargetBox
            label="שומן"
            value={p.targets.fat}
            color={colors.fat}
            editable={editingTargets && !p.autoTargets}
            onChange={(n) => updateProfile({ targets: { ...p.targets, fat: n } })}
          />
        </View>

        {!p.autoTargets ? (
          <Button
            title={editingTargets ? 'סיום עריכה' : 'ערוך יעדים ידנית'}
            variant="secondary"
            icon="create-outline"
            onPress={() => setEditingTargets((e) => !e)}
          />
        ) : null}

        <Field
          label="יעד מים יומי (מ״ל)"
          value={String(p.waterTargetMl)}
          numeric
          onChange={(v) =>
            updateProfile({ waterTargetMl: clamp(parseInt(v, 10) || 0, 500, 8000) })
          }
        />
      </Card>

      {/* תוכנית */}
      <SectionHeader title="תוכנית האימונים שלי" />
      <Card style={{ gap: spacing.md }}>
        <Text style={[styles.programName, rtlText]}>
          {program ? program.name : 'לא נבחרה תוכנית'}
        </Text>
        {program ? (
          <Text style={[styles.hint, rtlText]}>
            {program.daysPerWeek} אימונים בשבוע · {program.days.length} אימונים שונים
          </Text>
        ) : null}
        <Button
          title="החלף תוכנית"
          variant="secondary"
          icon="swap-horizontal"
          onPress={() => router.push('/(tabs)/workouts')}
        />
      </Card>

      {/* אודות */}
      <SectionHeader title="אודות" />
      <Card style={{ gap: spacing.sm }}>
        <Row icon="information-circle-outline" label="גרסה" value="1.0.0" />
        <Row
          icon="images-outline"
          label="מקור ההדגמות"
          value="free-exercise-db"
          onPress={() =>
            Linking.openURL('https://github.com/yuhonas/free-exercise-db').catch(() => {})
          }
        />
        <Row
          icon="shield-checkmark-outline"
          label="הנתונים שלך"
          value="נשמרים במכשיר בלבד"
        />
      </Card>

      <Card style={{ marginTop: spacing.lg, gap: spacing.md }}>
        <Text style={[styles.warn, rtlText]}>
          ⚠️ האפליקציה מספקת מידע כללי בלבד ואינה תחליף לייעוץ רפואי או לליווי של
          מאמן מוסמך. התייעצו עם רופא לפני תחילת תוכנית אימונים או תזונה.
        </Text>
      </Card>

      <Button
        title="איפוס כל הנתונים"
        variant="danger"
        icon="trash-outline"
        style={{ marginTop: spacing.lg }}
        onPress={() =>
          Alert.alert(
            'לאפס הכול?',
            'כל האימונים, התזונה והמדידות יימחקו לצמיתות מהמכשיר.',
            [
              { text: 'ביטול', style: 'cancel' },
              {
                text: 'מחק הכול',
                style: 'destructive',
                onPress: () => {
                  resetAll();
                  router.replace('/onboarding');
                },
              },
            ],
          )
        }
      />
    </ScrollView>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
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
      <Text style={[styles.label, rtlText]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(numeric ? t.replace(/[^0-9.]/g, '') : t)}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        style={[styles.input, rtlText, numeric && { textAlign: 'center' }]}
      />
    </View>
  );
}

function TargetBox({
  label,
  value,
  color,
  editable,
  onChange,
}: {
  label: string;
  value: number;
  color: string;
  editable: boolean;
  onChange: (n: number) => void;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      {editable ? (
        <TextInput
          value={String(value)}
          onChangeText={(t) => onChange(parseInt(t.replace(/[^0-9]/g, ''), 10) || 0)}
          keyboardType="number-pad"
          style={[styles.targetInput, { color }]}
        />
      ) : (
        <Text style={[styles.targetValue, { color }]}>{value}</Text>
      )}
      <Text style={styles.targetLabel}>{label}</Text>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: ROW,
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: 8,
      }}
    >
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <Text style={[styles.rowLabel, { flex: 1 }, rtlText]}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
      {onPress ? (
        <Ionicons name="open-outline" size={15} color={colors.textFaint} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  h1: { fontSize: 28, fontWeight: '900', color: colors.text },
  label: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  hint: { fontSize: 11, color: colors.textFaint, lineHeight: 17, marginTop: 2 },
  input: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.text,
    fontWeight: '700',
  },
  activityRow: {
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activityRowActive: { borderColor: colors.lime },
  activityLabel: { fontSize: 14, fontWeight: '800', color: colors.text },
  activityHint: { fontSize: 11, color: colors.textFaint, marginTop: 1 },
  targetValue: { fontSize: 19, fontWeight: '900' },
  targetInput: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    paddingVertical: 6,
    width: '100%',
  },
  targetLabel: { fontSize: 10, fontWeight: '700', color: colors.textFaint },
  programName: { fontSize: 16, fontWeight: '800', color: colors.text },
  rowLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  rowValue: { fontSize: 13, fontWeight: '700', color: colors.text },
  warn: { fontSize: 12, color: colors.textFaint, lineHeight: 19 },
});
