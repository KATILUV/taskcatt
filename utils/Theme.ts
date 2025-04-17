import { getResponsiveStyles } from './ResponsiveUtils';

// Color palette
export const colors = {
  // Primary colors
  primary: '#0066cc',
  primaryLight: '#4d94ff',
  primaryDark: '#004c99',
  
  // Secondary colors
  secondary: '#6c757d',
  secondaryLight: '#9aa0a6',
  secondaryDark: '#495057',
  
  // Accent colors
  accent: '#ff9800',
  accentLight: '#ffb74d',
  accentDark: '#f57c00',
  
  // Priority colors
  priorityHigh: '#E53935',
  priorityMedium: '#FB8C00',
  priorityLow: '#43A047',
  
  // Category colors
  categoryHealth: '#4CAF50',
  categoryWork: '#2196F3',
  categoryPersonal: '#9C27B0',
  categoryOther: '#757575',
  
  // Status colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  
  // Neutral colors
  white: '#ffffff',
  lightGray: '#f8f9fa',
  gray: '#e9ecef',
  darkGray: '#343a40',
  black: '#212529',
  
  // Text colors
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  textDisabled: '#adb5bd',
  textInverted: '#ffffff',
  
  // Background colors
  backgroundPrimary: '#f8f9fa',
  backgroundSecondary: '#e9ecef',
  backgroundCard: '#ffffff',
};

// Create theme with responsive styles
export const createTheme = () => {
  const responsive = getResponsiveStyles();
  
  return {
    colors,
    ...responsive,
    
    // Extended styles
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
      },
    },
    
    // Common component styles
    cardStyle: {
      backgroundColor: colors.backgroundCard,
      borderRadius: responsive.layout.cardRadius,
      padding: responsive.layout.cardPadding,
      ...{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    },
    
    headerStyle: {
      height: responsive.layout.headerHeight,
      backgroundColor: colors.primary,
      paddingHorizontal: responsive.spacing.md,
    },
    
    screenStyle: {
      flex: 1,
      backgroundColor: colors.backgroundPrimary,
      padding: responsive.layout.screenPadding,
    },
  };
};

// Default theme - for direct use
export const theme = createTheme();

// Export a theme-based mixin for creating component styles
export const createStyles = (styleCreator: (theme: ReturnType<typeof createTheme>) => any) => {
  return styleCreator(theme);
};