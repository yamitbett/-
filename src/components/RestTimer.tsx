import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { formatClock } from '../utils/date';

/** טיימר מנוחה שצף בתחתית מסך האימון */
export function RestTimer({
  seconds,
  onDone,
  onClose,
}: {
  seconds: number;
  onDone?: () => void;
  onClose: () => void;
}) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(true);
  const doneRef = useRef(false);

  useEffect(() => {
    setLeft(seconds);
    setRunning(true);
    doneRef.current = false;
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (left <= 0 && !doneRef.current) {
      doneRef.current = true;
      setRunning(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => {},
        );
      }
      onDone?.();
    }
  }, [left, onDone]);

  const pct = seconds > 0 ? Math.max(0, Math.min(left / seconds, 1)) : 0;
  const finished = left <= 0;

  return (
    <View style={styles.wrap}>
      <View style={[styles.progress, { width: `${pct * 100}%` }]} />
      <View style={styles.content}>
        <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </Pressable>

        <View style={styles.center}>
          <Text style={styles.label}>{finished ? 'המנוחה הסתיימה' : 'זמן מנוחה'}</Text>
          <Text style={[styles.time, finished && { color: colors.lime }]}>
            {formatClock(Math.max(0, left))}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => setLeft((v) => v + 15)}
            style={styles.action}
            hitSlop={6}
          >
            <Text style={styles.actionText}>15+</Text>
          </Pressable>
          <Pressable
            onPress={() => setRunning((r) => !r)}
            style={styles.action}
            hitSlop={6}
          >
            <Ionicons
              name={running ? 'pause' : 'play'}
              size={16}
              color={colors.text}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    overflow: 'hidden',
  },
  progress: {
    height: 3,
    backgroundColor: colors.lime,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  center: { alignItems: 'center' },
  label: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  time: { fontSize: 22, fontWeight: '900', color: colors.text, fontVariant: ['tabular-nums'] },
  close: { padding: 4 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: {
    width: 40,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontSize: 13, fontWeight: '800', color: colors.text },
});
