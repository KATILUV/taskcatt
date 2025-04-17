import React from 'react';
import { View, StyleSheet, Text, TextStyle } from 'react-native';
import { isTablet, scale, scaleFont } from '../utils/ResponsiveUtils';
import { createStyles, useTheme } from '../utils/Theme';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = scale(isTablet() ? 16 : 12),
  showPercentage = true,
}) => {
  const { theme } = useTheme();
  const styles = useStyles();
  
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  
  // Calculate color based on progress
  const getProgressColor = () => {
    if (normalizedProgress < 30) return theme.colors.error; // Red for low progress
    if (normalizedProgress < 70) return theme.colors.warning; // Amber for medium progress
    return theme.colors.success; // Green for high progress
  };
  
  // Get the text for the percentage label
  const getPercentageText = () => {
    return `${Math.round(normalizedProgress)}%`;
  };

  const progressColor = getProgressColor();

  return (
    <View style={styles.container}>
      <View style={[styles.progressBackground, { height }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${normalizedProgress}%`,
              backgroundColor: progressColor,
            }
          ]} 
        />
      </View>
      
      {showPercentage && (
        <Text style={[styles.percentageText, { color: progressColor }]}>
          {getPercentageText()}
        </Text>
      )}
    </View>
  );
};

// Use createStyles from Theme utils to create responsive styles
const useStyles = createStyles((theme) => {
  const isTab = isTablet();
  
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing.md,
    },
    progressBackground: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: scale(isTab ? 16 : 12),
      overflow: 'hidden',
      flex: 1,
      ...theme.shadows.small,
    },
    progressFill: {
      borderRadius: scale(isTab ? 16 : 12),
      height: '100%',
    },
    percentageText: {
      marginLeft: theme.spacing.md,
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
      fontSize: scaleFont(isTab ? 16 : 14),
      width: scale(isTab ? 54 : 44), // Fixed width to avoid layout shifts
      textAlign: 'right',
      letterSpacing: 0.3,
    } as TextStyle,
  });
});

export default ProgressBar;