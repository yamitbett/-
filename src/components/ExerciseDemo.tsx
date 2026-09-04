import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Exercise } from '../data/types';
import { colors, radius } from '../theme/theme';
import { demoFrames } from '../utils/media';

/**
 * הדגמת התרגיל: שני פריימים (התחלה וסיום) שמתחלפים בלולאה
 * ויוצרים אנימציית תנועה. אפשר לעצור ולהמשיך בלחיצה.
 */
export function ExerciseDemo({
  exercise,
  height = 220,
  autoPlay = true,
  rounded = radius.lg,
  showControls = true,
}: {
  exercise: Exercise;
  height?: number;
  autoPlay?: boolean;
  rounded?: number;
  showControls?: boolean;
}) {
  const frames = demoFrames(exercise.demoId);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % frames.length), 1100);
    return () => clearInterval(t);
  }, [playing, frames.length]);

  if (frames.length === 0 || failed) {
    return (
      <View style={[styles.fallback, { height, borderRadius: rounded }]}>
        <Ionicons name="barbell-outline" size={34} color={colors.textFaint} />
        <Text style={styles.fallbackText}>{exercise.name}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => setPlaying((p) => !p)}
      style={[styles.wrap, { height, borderRadius: rounded }]}
    >
      {/* שתי התמונות נטענות יחד כדי שהמעבר יהיה חלק */}
      {frames.map((uri, i) => (
        <Image
          key={uri}
          source={{ uri }}
          style={[StyleSheet.absoluteFill as object, { opacity: i === index ? 1 : 0 }]}
          contentFit="cover"
          transition={220}
          onError={() => setFailed(true)}
        />
      ))}

      {showControls ? (
        <>
          <View style={styles.badge}>
            <View style={[styles.dot, playing && styles.dotLive]} />
            <Text style={styles.badgeText}>{playing ? 'הדגמה' : 'מושהה'}</Text>
          </View>
          <View style={styles.playHint}>
            <Ionicons
              name={playing ? 'pause' : 'play'}
              size={16}
              color={colors.text}
            />
          </View>
        </>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.cardAlt,
  },
  fallback: {
    width: '100%',
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fallbackText: { color: colors.textFaint, fontSize: 13, fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  badgeText: { color: colors.text, fontSize: 11, fontWeight: '800' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textFaint },
  dotLive: { backgroundColor: colors.lime },
  playHint: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
