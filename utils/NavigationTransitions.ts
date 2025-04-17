import { Animated, Easing } from 'react-native';

// Types for card interpolation
interface AnimatedValue {
  progress: any; // Using any for progress to avoid TypeScript generics issues
}

interface ScreenDimensions {
  width: number;
  height: number;
}

interface ScreenLayouts {
  screen: ScreenDimensions;
}

interface CardInterpolationProps {
  current: AnimatedValue;
  next?: AnimatedValue;
  layouts: ScreenLayouts;
  closing?: boolean;
}

interface CardInterpolationResult {
  cardStyle?: object;
  overlayStyle?: object;
  nextCardStyle?: object;
}

// Enhanced transition configurations for React Navigation
export const transitionSpecs = {
  // Base transition configuration (shared across types)
  default: {
    animation: 'timing' as const,
    config: {
      duration: 350,
      easing: Easing.inOut(Easing.ease),
    },
  },
  // Quick transition for overlays and modals
  fast: {
    animation: 'timing' as const,
    config: {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    },
  },
  // Slow, emphasized transition for emphasis
  emphasized: {
    animation: 'timing' as const, 
    config: {
      duration: 400,
      easing: Easing.inOut(Easing.cubic),
    },
  },
  // Material Design inspired spring animation
  material: {
    animation: 'spring' as const,
    config: {
      stiffness: 1000,
      damping: 70,
      mass: 3,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  },
  // Bouncy spring animation for playful interactions
  bouncy: {
    animation: 'spring' as const,
    config: {
      stiffness: 100,
      damping: 10,
      mass: 1,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  },
};

// Slide-in from the right (for forward navigation)
export const slideFromRight = {
  gestureDirection: 'horizontal' as const,
  transitionSpec: {
    open: transitionSpecs.default,
    close: transitionSpecs.default,
  },
  cardStyleInterpolator: ({ current, layouts, next }: CardInterpolationProps): CardInterpolationResult => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
      // Subtle scaling for the outgoing screen
      nextCardStyle: next
        ? {
            transform: [
              {
                scale: next.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.95],
                }),
              },
            ],
            opacity: next.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.85],
            }),
          }
        : undefined,
    };
  },
};

// Fade transition (for modals or tabs)
export const fadeTransition = {
  gestureDirection: 'horizontal' as const,
  transitionSpec: {
    open: transitionSpecs.default,
    close: transitionSpecs.default,
  },
  cardStyleInterpolator: ({ current }: { current: AnimatedValue }): CardInterpolationResult => {
    return {
      cardStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
    };
  },
};

// Bottom to top slide (for modal-like screens)
export const slideFromBottom = {
  gestureDirection: 'vertical' as const,
  transitionSpec: {
    open: transitionSpecs.default,
    close: transitionSpecs.default,
  },
  cardStyleInterpolator: ({ current, layouts }: { current: AnimatedValue; layouts: ScreenLayouts }): CardInterpolationResult => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

// Scale transition (for emphasizing new content, like zooming in)
export const scaleTransition = {
  gestureDirection: 'horizontal' as const,
  transitionSpec: {
    open: transitionSpecs.emphasized,
    close: transitionSpecs.emphasized,
  },
  cardStyleInterpolator: ({ current }: { current: AnimatedValue }): CardInterpolationResult => {
    return {
      cardStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1],
        }),
        transform: [
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
        ],
      },
    };
  },
};

// Material Design inspired animation for switching between primary views
export const materialNavigationTransition = {
  gestureDirection: 'horizontal' as const,
  transitionSpec: {
    open: transitionSpecs.material,
    close: transitionSpecs.material,
  },
  cardStyleInterpolator: ({ current, layouts, next, closing }: CardInterpolationProps): CardInterpolationResult => {
    const translateX = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [layouts.screen.width, 0],
    });
    
    // Add a slight elevation change during transition
    const elevation = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 8],
    });

    // For next screen
    const nextCardOpacity = next ? next.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.5],
    }) : 1;
    
    const nextCardScale = next ? next.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.92],
    }) : 1;

    return {
      cardStyle: {
        transform: [{ translateX }],
        elevation,
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.1],
        }),
      },
      nextCardStyle: next ? {
        transform: [{ scale: nextCardScale }],
        opacity: nextCardOpacity,
      } : undefined,
    };
  },
};

// Playful transition with a slight bounce for Task Cat's personality
export const catTransition = {
  gestureDirection: 'horizontal' as const,
  transitionSpec: {
    open: transitionSpecs.bouncy,
    close: transitionSpecs.default,
  },
  cardStyleInterpolator: ({ current, layouts, next }: CardInterpolationProps): CardInterpolationResult => {
    const translateX = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [layouts.screen.width, 0],
    });
    
    // Add slight rotation for a playful effect
    const rotate = current.progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['2deg', '1deg', '0deg'],
    });

    // For next screen
    const nextCardScale = next ? next.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.85],
    }) : 1;
    
    const nextCardOpacity = next ? next.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.7],
    }) : 1;

    return {
      cardStyle: {
        transform: [
          { translateX },
          { rotate },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.3],
        }),
      },
      nextCardStyle: next ? {
        transform: [
          { scale: nextCardScale },
          { translateX: next.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -50],
          })},
        ],
        opacity: nextCardOpacity,
      } : undefined,
    };
  },
};