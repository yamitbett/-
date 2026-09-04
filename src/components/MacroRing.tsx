import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '../theme/theme';

export function MacroRing({
  value,
  target,
  size = 132,
  stroke = 12,
  color = colors.lime,
  label,
  unit = '',
  sublabel,
}: {
  value: number;
  target: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  unit?: string;
  sublabel?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const dash = c * pct;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.cardAlt}
            strokeWidth={stroke}
            fill="none"
          />
          {pct > 0 ? (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${c - dash}`}
              fill="none"
            />
          ) : null}
        </G>
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text style={[ringStyles.value, { fontSize: size / 4.6 }]}>
          {Math.round(value)}
          <Text style={ringStyles.unit}>{unit}</Text>
        </Text>
        {label ? <Text style={ringStyles.label}>{label}</Text> : null}
        {sublabel ? <Text style={ringStyles.sub}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

export function MacroBar({
  label,
  value,
  target,
  color,
  unit = 'ג',
}: {
  label: string;
  value: number;
  target: number;
  color: string;
  unit?: string;
}) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const over = value > target;
  return (
    <View style={barStyles.wrap}>
      <View style={barStyles.head}>
        <Text style={barStyles.label}>{label}</Text>
        <Text style={barStyles.value}>
          <Text style={{ color: over ? colors.warn : colors.text, fontWeight: '800' }}>
            {Math.round(value)}
          </Text>
          <Text style={{ color: colors.textFaint }}>
            /{Math.round(target)} {unit}
          </Text>
        </Text>
      </View>
      <View style={barStyles.track}>
        <View
          style={[
            barStyles.fill,
            { width: `${pct * 100}%`, backgroundColor: over ? colors.warn : color },
          ]}
        />
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  value: { fontWeight: '900', color: colors.text },
  unit: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  label: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginTop: 2 },
  sub: { fontSize: 11, fontWeight: '600', color: colors.textFaint, marginTop: 1 },
});

const barStyles = StyleSheet.create({
  wrap: { gap: 6 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  value: { fontSize: 13 },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cardAlt,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
});
