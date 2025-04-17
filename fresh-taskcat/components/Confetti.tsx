import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

interface ConfettiPiece {
  key: number;
  color: string;
  size: number;
  x: number;
  y: number;
}

interface ConfettiProps {
  count?: number;
  duration?: number;
  colors?: string[];
  onAnimationComplete?: () => void;
}

const Confetti: React.FC<ConfettiProps> = ({
  count = 30,
  duration = 2000,
  colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
  onAnimationComplete,
}) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const opacity = useSharedValue(1);

  // Generate confetti pieces
  const confettiPieces = useRef<ConfettiPiece[]>([]);
  
  if (confettiPieces.current.length === 0) {
    for (let i = 0; i < count; i++) {
      confettiPieces.current.push({
        key: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        x: Math.random() * screenWidth,
        y: -20, // Start above the screen
      });
    }
  }

  // Animation control
  useEffect(() => {
    opacity.value = 1;
    
    // Fade out at the end of animation
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 }, () => {
        if (onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      });
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration, opacity, onAnimationComplete]);

  // Main container style with opacity animation
  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {confettiPieces.current.map((piece, index) => {
        // Animated values for each piece
        const translateY = useSharedValue(0);
        const translateX = useSharedValue(piece.x);
        const rotate = useSharedValue(0);

        // Start the animation with a random delay
        useEffect(() => {
          const delay = Math.random() * 500;
          translateY.value = withDelay(
            delay,
            withTiming(screenHeight, { duration })
          );
          translateX.value = withDelay(
            delay,
            withTiming(
              piece.x + (Math.random() * 200 - 100),
              { duration }
            )
          );
          rotate.value = withDelay(
            delay,
            withTiming(
              Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1),
              { duration }
            )
          );
        }, []);

        // Piece style with position and rotation animations
        const pieceStyle = useAnimatedStyle(() => {
          return {
            transform: [
              { translateX: translateX.value },
              { translateY: translateY.value },
              { rotate: `${rotate.value}deg` },
            ],
          };
        });

        return (
          <Animated.View
            key={piece.key}
            style={[
              styles.piece,
              {
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? piece.size / 2 : 0,
              },
              pieceStyle,
            ]}
          />
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  piece: {
    position: 'absolute',
    top: 0,
  },
});

export default Confetti;