import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewProps,
} from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

export function Card({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.card, style]} />;
}

export function Row({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.row, style]} />;
}

export function Title({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.title, style]} />;
}

export function Subtitle({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.subtitle, style]} />;
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  title,
  icon,
  variant = 'primary',
  loading,
  style,
  disabled,
  ...props
}: PressableProps & {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: BtnVariant;
  loading?: boolean;
}) {
  const isPrimary = variant === 'primary';
  const bg =
    variant === 'primary'
      ? colors.lime
      : variant === 'danger'
        ? colors.dangerSoft
        : variant === 'ghost'
          ? 'transparent'
          : colors.cardAlt;
  const fg =
    variant === 'primary'
      ? '#0B0D0F'
      : variant === 'danger'
        ? colors.danger
        : colors.text;

  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
        variant === 'ghost' && styles.buttonGhost,
        style as object,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
          <Text
            style={[
              styles.buttonText,
              { color: fg, fontWeight: isPrimary ? '800' : '700' },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
  icon,
  color,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}) {
  const accent = color ?? colors.lime;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && { backgroundColor: accent, borderColor: accent },
        pressed && { opacity: 0.8 },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? '#0B0D0F' : colors.textMuted}
        />
      ) : null}
      <Text style={[styles.chipText, active && { color: '#0B0D0F' }]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({
  label,
  color = colors.lime,
  filled,
}: {
  label: string;
  color?: string;
  filled?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        filled
          ? { backgroundColor: color }
          : { backgroundColor: 'transparent', borderColor: color, borderWidth: 1 },
      ]}
    >
      <Text
        style={[styles.badgeText, { color: filled ? '#0B0D0F' : color }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export function IconButton({
  name,
  onPress,
  color = colors.text,
  size = 20,
  bg = colors.cardAlt,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  color?: string;
  size?: number;
  bg?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: bg, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

export function EmptyState({
  icon = 'sparkles-outline',
  title,
  text,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  text?: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={26} color={colors.textFaint} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {text ? <Text style={styles.emptyText}>{text}</Text> : null}
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '800', color: colors.text, textAlign: 'right' },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'right' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  sectionAction: { fontSize: 13, fontWeight: '700', color: colors.lime },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  buttonGhost: { borderWidth: 1, borderColor: colors.border },
  buttonText: { fontSize: 15 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 11, fontWeight: '800' },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.textMuted },
  emptyText: {
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 19,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
});
