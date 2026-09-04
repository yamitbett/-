import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { ROW_LTR } from '../theme/rtl';
import { colors, radius } from '../theme/theme';

export interface Point {
  label: string;
  value: number;
}

/** גרף קו פשוט עם מילוי הדרגתי – לשקילות ולנפח אימון */
export function LineChart({
  points,
  height = 160,
  width,
  color = colors.lime,
  suffix = '',
}: {
  points: Point[];
  height?: number;
  width: number;
  color?: string;
  suffix?: string;
}) {
  if (points.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>
          צריך לפחות שתי מדידות כדי להציג גרף
        </Text>
      </View>
    );
  }

  const padX = 12;
  const padY = 16;
  const w = Math.max(width, 40);
  const innerW = w - padX * 2;
  const innerH = height - padY * 2;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const coords = points.map((p, i) => ({
    x: padX + (i / (points.length - 1)) * innerW,
    y: padY + innerH - ((p.value - min) / span) * innerH,
  }));

  const line = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(' ');
  const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${height - padY} L${coords[0].x.toFixed(1)},${height - padY} Z`;

  return (
    <View>
      <Svg width={w} height={height}>
        <Defs>
          <LinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.28" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={area} fill="url(#chartFill)" />
        <Path d={line} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
        {coords.map((c, i) => (
          <Circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={i === coords.length - 1 ? 5 : 3}
            fill={i === coords.length - 1 ? color : colors.bg}
            stroke={color}
            strokeWidth={2}
          />
        ))}
      </Svg>
      <View style={styles.axis}>
        <Text style={styles.axisText}>
          {points[0].label} · {min.toFixed(1)}
          {suffix}
        </Text>
        <Text style={styles.axisText}>
          {points[points.length - 1].label} · {max.toFixed(1)}
          {suffix}
        </Text>
      </View>
    </View>
  );
}

/** גרף עמודות אופקי־אנכי לנפח שבועי */
export function BarChart({
  points,
  width,
  height = 140,
  color = colors.lime,
}: {
  points: Point[];
  width: number;
  height?: number;
  color?: string;
}) {
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <View style={{ width }}>
      <View style={[styles.bars, { height }]}>
        {points.map((p, i) => (
          <View key={i} style={styles.barCol}>
            <View
              style={{
                width: '70%',
                height: Math.max(4, (p.value / max) * (height - 24)),
                backgroundColor: p.value > 0 ? color : colors.cardAlt,
                borderRadius: 5,
              }}
            />
            <Text style={styles.barLabel}>{p.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
  },
  emptyText: { color: colors.textFaint, fontSize: 13 },
  axis: { flexDirection: ROW_LTR, justifyContent: 'space-between', marginTop: 4 },
  axisText: { fontSize: 11, color: colors.textFaint, fontWeight: '600' },
  bars: {
    flexDirection: ROW_LTR,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barLabel: { fontSize: 10, color: colors.textFaint, fontWeight: '700' },
});
