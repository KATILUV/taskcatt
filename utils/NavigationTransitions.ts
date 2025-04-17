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
}

interface CardInterpolationResult {
  cardStyle?: object;
  overlayStyle?: object;
  nextCardStyle?: object;
}

// Custom transition configurations for React Navigation
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