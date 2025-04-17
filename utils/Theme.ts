import { getResponsiveStyles } from './ResponsiveUtils';
import { Appearance, ColorSchemeName } from 'react-native';
import { createContext, useState, useEffect, useContext } from 'react';

// Common colors that don't change between themes
const commonColors = {
  // Primary colors
  primary: '#0066cc',
  primaryLight: '#4d94ff',
  primaryDark: '#004c99',
  
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
  successLight: '#a5d6a7',
  warning: '#ff9800',
  warningLight: '#ffcc80',
  error: '#f44336',
  errorLight: '#ef9a9a',
  info: '#2196f3',
  infoLight: '#90caf9',
};

// Light theme colors
export const lightColors = {
  ...commonColors,
  
  // Secondary colors for light theme
  secondary: '#6c757d',
  secondaryLight: '#9aa0a6',
  secondaryDark: '#495057',
  
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
  
  // Icon colors
  iconPrimary: '#212529',
  iconSecondary: '#6c757d',
  iconDisabled: '#adb5bd',
  iconAccent: '#0066cc',
  
  // Shadow colors
  shadowColor: '#000000',
};

// Dark theme colors
export const darkColors = {
  ...commonColors,
  
  // Secondary colors for dark theme
  secondary: '#9aa0a6',
  secondaryLight: '#bdc4c9',
  secondaryDark: '#6c757d',
  
  // Neutral colors
  white: '#ffffff', // Still needed for specific UI elements
  lightGray: '#2c3035',
  gray: '#343a40',
  darkGray: '#dee2e6',
  black: '#f8f9fa',
  
  // Text colors
  textPrimary: '#f8f9fa',
  textSecondary: '#ced4da',
  textDisabled: '#6c757d',
  textInverted: '#212529',
  
  // Background colors
  backgroundPrimary: '#121212',
  backgroundSecondary: '#1e1e1e',
  backgroundCard: '#2c2c2c',
  
  // Icon colors
  iconPrimary: '#f8f9fa',
  iconSecondary: '#ced4da',
  iconDisabled: '#6c757d',
  iconAccent: '#4d94ff',
  
  // Shadow colors
  shadowColor: '#000000',
};

// Type definitions
export type ThemeType = 'light' | 'dark' | 'system';

// Create theme with responsive styles
export const createTheme = (colorScheme: ThemeType | ColorSchemeName = 'light') => {
  // Determine which color scheme to use
  let activeColorScheme: 'light' | 'dark';
  
  if (colorScheme === 'system') {
    const systemScheme = Appearance.getColorScheme();
    activeColorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  } else {
    activeColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
  }
  
  // Select colors based on active scheme
  const colors = activeColorScheme === 'dark' ? darkColors : lightColors;
  
  // Get responsive styles
  const responsive = getResponsiveStyles();
  
  // Create shadow with correct opacity based on theme
  const createShadow = (level: 'small' | 'medium' | 'large') => {
    const shadowConfig = {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: level === 'small' ? 1 : level === 'medium' ? 2 : 4 },
      shadowOpacity: activeColorScheme === 'dark' ? 
        (level === 'small' ? 0.3 : level === 'medium' ? 0.4 : 0.5) :
        (level === 'small' ? 0.18 : level === 'medium' ? 0.23 : 0.3),
      shadowRadius: level === 'small' ? 1.0 : level === 'medium' ? 2.62 : 4.65,
      elevation: level === 'small' ? 1 : level === 'medium' ? 4 : 8,
    };
    
    return shadowConfig;
  };
  
  return {
    colors,
    themeType: activeColorScheme,
    ...responsive,
    
    // Font configuration
    fonts: {
      regular: 'Inter',
      medium: 'Inter-Medium',
      semiBold: 'Inter-SemiBold',
      bold: 'Inter-Bold',
    },
    
    // Typography styles
    typography: {
      h1: {
        fontFamily: 'Inter-Bold',
        fontSize: 28,
        lineHeight: 34,
        letterSpacing: 0.25,
        color: colors.textPrimary,
      },
      h2: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 24,
        lineHeight: 30,
        letterSpacing: 0.25,
        color: colors.textPrimary,
      },
      h3: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 20,
        lineHeight: 26,
        letterSpacing: 0.15,
        color: colors.textPrimary,
      },
      subtitle1: {
        fontFamily: 'Inter-Medium',
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0.15,
        color: colors.textPrimary,
      },
      subtitle2: {
        fontFamily: 'Inter-Medium',
        fontSize: 16,
        lineHeight: 22,
        letterSpacing: 0.1,
        color: colors.textPrimary,
      },
      body1: {
        fontFamily: 'Inter',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0.5,
        color: colors.textSecondary,
      },
      body2: {
        fontFamily: 'Inter',
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.25,
        color: colors.textSecondary,
      },
      button: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        lineHeight: 18,
        letterSpacing: 1.25,
        textTransform: 'uppercase',
        color: colors.textInverted,
      },
      caption: {
        fontFamily: 'Inter',
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 0.4,
        color: colors.textSecondary,
      },
      overline: {
        fontFamily: 'Inter-Medium',
        fontSize: 10,
        lineHeight: 16,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: colors.textSecondary,
      },
    },
    
    // Extended styles
    shadows: {
      small: createShadow('small'),
      medium: createShadow('medium'),
      large: createShadow('large'),
    },
    
    // Common component styles
    cardStyle: {
      backgroundColor: colors.backgroundCard,
      borderRadius: responsive.layout.cardRadius,
      padding: responsive.layout.cardPadding,
      fontFamily: 'Inter',
      ...createShadow('small')
    },
    
    headerStyle: {
      height: responsive.layout.headerHeight,
      backgroundColor: colors.primary,
      paddingHorizontal: responsive.spacing.md,
      fontFamily: 'Inter-SemiBold',
    },
    
    screenStyle: {
      flex: 1,
      backgroundColor: colors.backgroundPrimary,
      padding: responsive.layout.screenPadding,
      fontFamily: 'Inter',
    },
  };
};

// Default theme (starting with light) - for direct use
export const defaultTheme = createTheme('light');

// Create the context
type ThemeContextProps = {
  theme: ReturnType<typeof createTheme>;
  themeType: ThemeType;
  toggleTheme: () => void;
  setThemeType: (themeType: ThemeType) => void;
};

export const ThemeContext = createContext<ThemeContextProps>({
  theme: defaultTheme,
  themeType: 'light',
  toggleTheme: () => {},
  setThemeType: () => {},
});

// Theme Provider
export const useTheme = () => useContext(ThemeContext);

// Export a theme-based mixin for creating component styles
export const createStyles = (styleCreator: (theme: ReturnType<typeof createTheme>) => any) => {
  return styleCreator(defaultTheme);
};