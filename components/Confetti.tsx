import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useTheme } from '../utils/Theme';

interface ConfettiPiece {
  key: number;
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'triangle';
}

interface ConfettiProps {
  count?: number;
  duration?: number;
  colors?: string[];
  onAnimationComplete?: () => void;
}

const Confetti: React.FC<ConfettiProps> = ({ 
  count = 50, 
  duration = 2000,
  colors: propColors,
  onAnimationComplete
}) => {
  const { theme } = useTheme();
  const { width, height } = Dimensions.get('window');
  
  // Get colors from theme if not provided
  const colors = propColors || [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.accent,
    theme.colors.success,
    theme.colors.categoryHealth,
    theme.colors.categoryWork,
    theme.colors.categoryPersonal,
    theme.colors.priorityHigh,
    theme.colors.priorityMedium,
  ];

  // Create confetti pieces with initial state
  const confettiPieces = useRef<ConfettiPiece[]>([]);
  
  if (confettiPieces.current.length === 0) {
    for (let i = 0; i < count; i++) {
      const shape = ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle';
      confettiPieces.current.push({
        key: i,
        x: new Animated.Value(width / 2),
        y: new Animated.Value(height / 3),
        rotate: new Animated.Value(0),
        scale: new Animated.Value(0),
        opacity: new Animated.Value(1),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5, // Random size between 5 and 15
        shape,
      });
    }
  }
  
  useEffect(() => {
    // Start animation for each piece
    const animations = confettiPieces.current.map((piece) => {
      // Randomize animation paths and timings
      const toX = Math.random() * width;
      const toY = Math.random() * height;
      const rotations = Math.random() * 10;
      const scaleTo = Math.random() * 0.8 + 0.2; // Scale between 0.2 and 1
      
      return Animated.parallel([
        Animated.timing(piece.x, {
          toValue: toX,
          duration,
          easing: Easing.bezier(0.1, 0.25, 0.1, 1),
          useNativeDriver: true,
        }),
        Animated.timing(piece.y, {
          toValue: toY,
          duration: duration + Math.random() * 1000,
          easing: Easing.bezier(0.1, 0.25, 0.1, 1),
          useNativeDriver: true,
        }),
        Animated.timing(piece.rotate, {
          toValue: rotations,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(piece.scale, {
            toValue: scaleTo,
            duration: duration * 0.2,
            easing: Easing.bezier(0.1, 0.25, 0.1, 1),
            useNativeDriver: true,
          }),
          Animated.timing(piece.scale, {
            toValue: 0,
            duration: duration * 0.8,
            easing: Easing.bezier(0.1, 0.25, 0.1, 1),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(piece.opacity, {
          toValue: 0,
          duration: duration,
          easing: Easing.bezier(0, 0, 0, 1),
          useNativeDriver: true,
        }),
      ]);
    });
    
    // Start all animations at once
    Animated.stagger(20, animations).start(({ finished }) => {
      if (finished && onAnimationComplete) {
        onAnimationComplete();
      }
    });
    
    // Cleanup function
    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [width, height, duration, onAnimationComplete]);
  
  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.current.map((piece) => {
        // Create transform array with rotation
        const rotate = piece.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });
        
        return (
          <Animated.View
            key={piece.key}
            style={[
              styles.piece,
              {
                backgroundColor: piece.shape === 'circle' ? piece.color : 'transparent',
                width: piece.size,
                height: piece.size,
                borderRadius: piece.shape === 'circle' ? piece.size / 2 : 0,
                borderWidth: piece.shape === 'triangle' ? piece.size : 0,
                borderBottomWidth: piece.shape === 'triangle' ? piece.size * 1.2 : 0,
                borderColor: piece.shape === 'triangle' ? 'transparent' : piece.color,
                borderBottomColor: piece.shape === 'triangle' ? piece.color : 'transparent',
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                transform: [
                  { translateX: piece.x },
                  { translateY: piece.y },
                  { rotate },
                  { scale: piece.scale },
                ],
                opacity: piece.opacity,
              },
              piece.shape === 'square' && { backgroundColor: piece.color },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  piece: {
    position: 'absolute',
  },
});

export default Confetti;