import { Dimensions, Platform, PixelRatio, ScaledSize } from 'react-native';

// Screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions - these are the screen dimensions that the UI is designed for
const BASE_WIDTH = 375; // Standard iPhone width
const BASE_HEIGHT = 812; // iPhone X height

// Determine if device is a tablet
export const isTablet = (): boolean => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  
  return (
    // iPad detection for iOS
    (Platform.OS === 'ios' && Platform.isPad) ||
    // Android and web tablet detection based on screen size
    (adjustedWidth >= 900 || adjustedHeight >= 900)
  );
};

// Scale a size based on screen width
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

// Scale a size based on screen height
export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

// Scale a size proportionally to both dimensions for consistent sizing
export const scale = (size: number): number => {
  const factor = Math.min(SCREEN_WIDTH / BASE_WIDTH, SCREEN_HEIGHT / BASE_HEIGHT);
  return size * factor;
};

// Handle text scaling
export const scaleFont = (size: number): number => {
  const scaledSize = scale(size);
  
  // On tablets, reduce the scaling factor to avoid overly large text
  if (isTablet()) {
    return scaledSize * 0.8;
  }
  
  return scaledSize;
};

// Generate responsive style values based on screen size
export const getResponsiveStyles = () => {
  const isTab = isTablet();
  
  return {
    // Spacing values
    spacing: {
      xs: scale(4),
      sm: scale(8),
      md: scale(16),
      lg: scale(24),
      xl: scale(32),
      xxl: scale(48),
    },
    
    // Layout values
    layout: {
      // Padding for screen containers
      screenPadding: isTab ? scale(24) : scale(16),
      
      // Header heights
      headerHeight: isTab ? scale(70) : scale(60),
      
      // Card dimensions
      cardRadius: isTab ? scale(12) : scale(8),
      cardPadding: isTab ? scale(20) : scale(16),
      
      // List item dimensions
      listItemHeight: isTab ? scale(80) : scale(65),
      listItemSpacing: isTab ? scale(12) : scale(8),
    },
    
    // Typography sizing
    typography: {
      header1: scaleFont(isTab ? 32 : 28),
      header2: scaleFont(isTab ? 28 : 24),
      header3: scaleFont(isTab ? 24 : 20),
      body: scaleFont(isTab ? 18 : 16),
      caption: scaleFont(isTab ? 16 : 14),
      small: scaleFont(isTab ? 14 : 12),
    },
    
    // Component sizing
    components: {
      // Button dimensions
      buttonHeight: isTab ? scale(56) : scale(48),
      buttonRadius: isTab ? scale(12) : scale(8),
      
      // Input dimensions
      inputHeight: isTab ? scale(60) : scale(48),
      inputRadius: isTab ? scale(12) : scale(8),
      
      // Icon sizes
      iconSizeLarge: isTab ? scale(32) : scale(24),
      iconSizeMedium: isTab ? scale(24) : scale(20),
      iconSizeSmall: isTab ? scale(20) : scale(16),
    },
  };
};

// Listen to dimension changes
export const addDimensionsEventListener = (callback: (dimensions: ScaledSize) => void) => {
  return Dimensions.addEventListener('change', ({ window }) => {
    callback(window);
  });
};