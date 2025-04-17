import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, Surface, useTheme as usePaperTheme } from 'react-native-paper';
import { useTheme } from '../utils/Theme';
import { isTablet, scale, scaleFont } from '../utils/ResponsiveUtils';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Define allowed icon names explicitly for TypeScript
type IconName = 'cat' | 'clipboard-text-outline' | 'repeat' | 'alert-circle-outline' | 'alert-circle';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: IconName;
  type?: 'default' | 'tasks' | 'routines' | 'error';
  style?: ViewStyle;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  type = 'default',
  style,
}) => {
  const { theme } = useTheme();
  const paperTheme = usePaperTheme();
  
  // Default icon based on type if none provided
  const getDefaultIcon = () => {
    switch (type) {
      case 'tasks':
        return 'clipboard-text-outline' as const;
      case 'routines':
        return 'repeat' as const;
      case 'error':
        return 'alert-circle-outline' as const;
      default:
        return 'cat' as const;
    }
  };
  
  const iconToShow = icon || getDefaultIcon();
  
  // Colors based on type
  const getIconColor = (): string => {
    switch (type) {
      case 'tasks':
        return theme.colors.primary;
      case 'routines':
        return theme.colors.accent;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.secondary;
    }
  };
  
  const iconColor = getIconColor();
  const isTabletDevice = isTablet();
  
  // Generate an SVG cat illustration based on the type
  const CatSVG = () => (
    <View style={styles.svgContainer}>
      {/* This is an inline SVG representation of a cat with empty tasks */}
      <View style={[styles.catBackground, { backgroundColor: iconColor + '20' }]}>
        <View style={styles.catIllustration}>
          {/* Cat face */}
          <View style={[styles.catHead, { backgroundColor: iconColor + '60' }]} />
          
          {/* Cat ears */}
          <View style={[styles.catEarLeft, { backgroundColor: iconColor + '60' }]} />
          <View style={[styles.catEarRight, { backgroundColor: iconColor + '60' }]} />
          
          {/* Cat eyes */}
          <View style={[styles.catEye, { left: scale(28), backgroundColor: theme.colors.white }]} />
          <View style={[styles.catEye, { right: scale(28), backgroundColor: theme.colors.white }]} />
          
          {/* Cat pupils */}
          <View style={[styles.catPupil, { left: scale(30), backgroundColor: iconColor }]} />
          <View style={[styles.catPupil, { right: scale(30), backgroundColor: iconColor }]} />
          
          {/* Cat nose */}
          <View style={[styles.catNose, { backgroundColor: iconColor + '80' }]} />
          
          {/* Cat mouth */}
          <View style={[styles.catMouth, { borderColor: iconColor + '80' }]} />
          
          {/* Whiskers */}
          <View style={[styles.whiskerLeft, { backgroundColor: iconColor + '80' }]} />
          <View style={[styles.whiskerRight, { backgroundColor: iconColor + '80' }]} />
        </View>
      </View>
    </View>
  );
  
  return (
    <Surface style={[styles.container, style]}>
      <CatSVG />
      
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={iconToShow} size={scale(isTabletDevice ? 80 : 60)} color={iconColor} />
      </View>
      
      <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.textPrimary }]}>
        {title}
      </Text>
      
      <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.textSecondary }]}>
        {message}
      </Text>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 0,
    backgroundColor: 'transparent',
  } as ViewStyle,
  iconContainer: {
    marginBottom: 16,
  } as ViewStyle,
  title: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    maxWidth: scale(300),
    lineHeight: 22,
  },
  svgContainer: {
    marginBottom: 20,
    width: scale(200),
    height: scale(160),
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  catBackground: {
    width: scale(160),
    height: scale(140),
    borderRadius: scale(80),
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  catIllustration: {
    width: scale(100),
    height: scale(100),
    position: 'relative',
  } as ViewStyle,
  catHead: {
    width: scale(100),
    height: scale(80),
    borderRadius: scale(50),
    position: 'absolute',
    top: scale(20),
  } as ViewStyle,
  catEarLeft: {
    width: scale(25),
    height: scale(25),
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(10),
    transform: [{ rotate: '-30deg' }],
    position: 'absolute',
    top: scale(5),
    left: scale(15),
  } as ViewStyle,
  catEarRight: {
    width: scale(25),
    height: scale(25),
    borderTopLeftRadius: scale(10),
    borderTopRightRadius: scale(20),
    transform: [{ rotate: '30deg' }],
    position: 'absolute',
    top: scale(5),
    right: scale(15),
  } as ViewStyle,
  catEye: {
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    position: 'absolute',
    top: scale(45),
  } as ViewStyle,
  catPupil: {
    width: scale(8),
    height: scale(12),
    borderRadius: scale(4),
    position: 'absolute',
    top: scale(47),
  } as ViewStyle,
  catNose: {
    width: scale(10),
    height: scale(6),
    borderRadius: scale(3),
    position: 'absolute',
    top: scale(60),
    left: scale(45),
  } as ViewStyle,
  catMouth: {
    width: scale(20),
    height: scale(10),
    borderBottomWidth: 2,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderRadius: scale(10),
    position: 'absolute',
    top: scale(65),
    left: scale(40),
  } as ViewStyle,
  whiskerLeft: {
    width: scale(25),
    height: scale(1),
    position: 'absolute',
    top: scale(60),
    left: scale(10),
    transform: [{ rotate: '-10deg' }],
  } as ViewStyle,
  whiskerRight: {
    width: scale(25),
    height: scale(1),
    position: 'absolute',
    top: scale(60),
    right: scale(10),
    transform: [{ rotate: '10deg' }],
  } as ViewStyle,
});

export default EmptyState;