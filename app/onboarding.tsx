import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
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
import { Button, Card, Chip } from '../src/components/ui';
import { PROGRAMS } from '../src/data/programs';
import { LEVEL_LABEL } from '../src/data/types';
import { useApp } from '../src/store/AppStore';
import { ROW, rtlText } from '../src/theme/rtl';
import { colors, radius, spacing } from '../src/theme/theme';
import {
  ACTIVITY_LEVELS,
  calcTargets,
  GOAL_OPTIONS,
  GoalValue,
} from '../src/utils/nutrition';

const STEPS = ['ברוכים הבאים', 'עליי', 'המטרה שלי', 'תוכנית אימונים'];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateProfile, logWeight } = useApp();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [age, setAge] = useState('28');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('75');
  const [goal, setGoal] = useState<GoalValue>('gain');
  const [activity, setActivity] = useState(1.55);
  const [programId, setProgramId] = useState<string | null>(PROGRAMS[0].id);

  const numbers = useMemo(
    () => ({
      age: parseInt(age, 10) || 28,
      heightCm: parseInt(height, 10) || 175,
      weightKg: parseFloat(weight) || 75,
    }),
    [age, height, weight],
  );

  const targets = useMemo(
    () => calcTargets({ ...numbers, gender, activity, goal }),
    [numbers, gender, activity, goal],
  );

  const finish = () => {
    updateProfile({
      name: name.trim(),
      gender,
      age: numbers.age,
      heightCm: numbers.heightCm,
      weightKg: numbers.weightKg,
      goal,
      activity,
      programId,
      autoTargets: true,
      onboarded: true,
    });
    logWeight(numbers.weightKg);
    router.replace('/(tabs)/home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top + spacing.lg, paddingHorizontal: spacing.lg }}>
        <View style={[styles.steps, { flexDirection: ROW }]}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.stepBar, i <= step && { backgroundColor: colors.lime }]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xxl,
          gap: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 0 ? (
          <View style={{ gap: spacing.lg, alignItems: 'center', paddingTop: spacing.xxl }}>
            <LinearGradient
              colors={[colors.lime, colors.limeDim]}
              style={styles.logo}
            >
              <Ionicons name="barbell" size={40} color="#0B0D0F" />
            </LinearGradient>
            <Text style={styles.welcome}>FitBuddy</Text>
            <Text style={styles.welcomeSub}>המאמן האישי שלך</Text>
            <Text style={[styles.welcomeText, rtlText]}>
              תוכניות אימון מובנות, ספריית תרגילים עם הדגמות והסברים, מעקב סטים
              ומשקלים, יומן תזונה עם מאגר מזון בעברית ומעקב התקדמות – הכול במקום
              אחד, והכול נשמר במכשיר שלך.
            </Text>
            <View style={{ gap: spacing.md, width: '100%', marginTop: spacing.lg }}>
              <Feature icon="barbell" text="61 תרגילים עם הדגמה, טכניקה וטעויות נפוצות" />
              <Feature icon="restaurant" text="79 מוצרי מזון כולל מטבח ישראלי" />
              <Feature icon="stats-chart" text="מעקב שיאים אישיים ונפח אימון" />
            </View>
          </View>
        ) : null}

        {step === 1 ? (
          <View style={{ gap: spacing.lg }}>
            <Text style={[styles.title, rtlText]}>ספרו לנו עליכם</Text>
            <Card style={{ gap: spacing.md }}>
              <Field label="איך קוראים לך?" value={name} onChange={setName} placeholder="השם שלך" />
              <Text style={[styles.label, rtlText]}>מין</Text>
              <View style={{ flexDirection: ROW, gap: spacing.sm }}>
                <Chip label="גבר" active={gender === 'male'} onPress={() => setGender('male')} />
                <Chip label="אישה" active={gender === 'female'} onPress={() => setGender('female')} />
                <Chip label="אחר" active={gender === 'other'} onPress={() => setGender('other')} />
              </View>
              <View style={{ flexDirection: ROW, gap: spacing.md }}>
                <Field label="גיל" value={age} onChange={setAge} numeric style={{ flex: 1 }} />
                <Field label="גובה (ס״מ)" value={height} onChange={setHeight} numeric style={{ flex: 1 }} />
                <Field label="משקל (ק״ג)" value={weight} onChange={setWeight} numeric style={{ flex: 1 }} />
              </View>
            </Card>
          </View>
        ) : null}

        {step === 2 ? (
          <View style={{ gap: spacing.lg }}>
            <Text style={[styles.title, rtlText]}>מה המטרה שלך?</Text>
            <View style={{ gap: spacing.md }}>
              {GOAL_OPTIONS.map((g) => (
                <Pressable
                  key={g.value}
                  onPress={() => setGoal(g.value)}
                  style={[
                    styles.goalCard,
                    { flexDirection: ROW },
                    goal === g.value && styles.goalCardActive,
                  ]}
                >
                  <Text style={{ fontSize: 26 }}>{g.emoji}</Text>
                  <Text style={[styles.goalLabel, { flex: 1 }, rtlText]}>{g.label}</Text>
                  <Ionicons
                    name={goal === g.value ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={goal === g.value ? colors.lime : colors.textFaint}
                  />
                </Pressable>
              ))}
            </View>

            <Text style={[styles.title, rtlText, { fontSize: 18 }]}>רמת פעילות</Text>
            <View style={{ gap: spacing.sm }}>
              {ACTIVITY_LEVELS.map((a) => (
                <Pressable
                  key={a.value}
                  onPress={() => setActivity(a.value)}
                  style={[
                    styles.activityRow,
                    { flexDirection: ROW },
                    activity === a.value && styles.goalCardActive,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.activityLabel, rtlText]}>{a.label}</Text>
                    <Text style={[styles.activityHint, rtlText]}>{a.hint}</Text>
                  </View>
                  <Ionicons
                    name={activity === a.value ? 'radio-button-on' : 'radio-button-off'}
                    size={19}
                    color={activity === a.value ? colors.lime : colors.textFaint}
                  />
                </Pressable>
              ))}
            </View>

            <Card style={{ gap: spacing.sm }}>
              <Text style={[styles.label, rtlText]}>היעדים היומיים שחישבנו עבורך</Text>
              <View style={{ flexDirection: ROW, gap: spacing.md }}>
                <Target label="קלוריות" value={targets.calories} color={colors.calories} />
                <Target label="חלבון" value={targets.protein} color={colors.protein} />
                <Target label="פחמימות" value={targets.carbs} color={colors.carbs} />
                <Target label="שומן" value={targets.fat} color={colors.fat} />
              </View>
              <Text style={[styles.hint, rtlText]}>
                אפשר לשנות את היעדים בכל רגע במסך הפרופיל.
              </Text>
            </Card>
          </View>
        ) : null}

        {step === 3 ? (
          <View style={{ gap: spacing.lg }}>
            <Text style={[styles.title, rtlText]}>בחרו תוכנית להתחיל איתה</Text>
            <View style={{ gap: spacing.md }}>
              {PROGRAMS.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => setProgramId(p.id)}
                  style={[styles.programCard, programId === p.id && styles.goalCardActive]}
                >
                  <View style={{ flexDirection: ROW, alignItems: 'center', gap: spacing.md }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.programName, rtlText]}>{p.name}</Text>
                      <Text style={[styles.programMeta, rtlText]}>
                        {p.daysPerWeek} אימונים בשבוע · {LEVEL_LABEL[p.level]}
                      </Text>
                    </View>
                    <Ionicons
                      name={programId === p.id ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={programId === p.id ? colors.lime : colors.textFaint}
                    />
                  </View>
                  <Text style={[styles.programDesc, rtlText]}>{p.description}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md, flexDirection: ROW }]}>
        {step > 0 ? (
          <Button
            title="חזרה"
            variant="ghost"
            style={{ flex: 1 }}
            onPress={() => setStep((s) => s - 1)}
          />
        ) : null}
        <Button
          title={step === STEPS.length - 1 ? 'בואו נתחיל!' : 'המשך'}
          icon={step === STEPS.length - 1 ? 'rocket' : 'arrow-back'}
          style={{ flex: 2 }}
          onPress={() => (step === STEPS.length - 1 ? finish() : setStep((s) => s + 1))}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function Feature({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={{ flexDirection: ROW, alignItems: 'center', gap: spacing.md }}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={17} color={colors.lime} />
      </View>
      <Text style={[styles.featureText, { flex: 1 }, rtlText]}>{text}</Text>
    </View>
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

function Target({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 3 }}>
      <Text style={{ fontSize: 18, fontWeight: '900', color }}>{value}</Text>
      <Text style={styles.targetLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  steps: { gap: 6 },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardAlt,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcome: { fontSize: 34, fontWeight: '900', color: colors.text },
  welcomeSub: { fontSize: 15, fontWeight: '700', color: colors.lime, marginTop: -6 },
  welcomeText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.limeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '900', color: colors.text },
  label: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  hint: { fontSize: 11, color: colors.textFaint, lineHeight: 17 },
  input: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.text,
    fontWeight: '700',
  },
  goalCard: {
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
  },
  goalCardActive: { borderColor: colors.lime },
  goalLabel: { fontSize: 16, fontWeight: '800', color: colors.text },
  activityRow: {
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
  },
  activityLabel: { fontSize: 14, fontWeight: '800', color: colors.text },
  activityHint: { fontSize: 11, color: colors.textFaint, marginTop: 1 },
  targetLabel: { fontSize: 10, fontWeight: '700', color: colors.textFaint },
  programCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    gap: spacing.sm,
  },
  programName: { fontSize: 16, fontWeight: '800', color: colors.text },
  programMeta: { fontSize: 11, color: colors.textFaint, marginTop: 2, fontWeight: '600' },
  programDesc: { fontSize: 12, color: colors.textMuted, lineHeight: 19 },
  footer: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
