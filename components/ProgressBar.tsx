import React from 'react';
import { View, StyleSheet, TextStyle } from 'react-native';
import { ProgressBar as PaperProgressBar, Text, useTheme as usePaperTheme } from 'react-native-paper';
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

  // Access Paper theme
  const paperTheme = usePaperTheme();
  
  // Convert progress from percentage (0-100) to decimal (0-1) for Paper ProgressBar
  const progressDecimal = normalizedProgress / 100;
  
  return (
    <View style={styles.container}>
      <View style={[styles.progressContainer, { height }]}>
        <PaperProgressBar
          progress={progressDecimal}
          color={progressColor}
          style={styles.paperProgressBar}
        />
      </View>
      
      {showPercentage && (
        <Text
          variant="labelMedium"
          style={[styles.percentageText, { color: progressColor }]}
        >
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
    progressContainer: {
      flex: 1,
      justifyContent: 'center',
      overflow: 'hidden',
    },
    paperProgressBar: {
      height: '100%',
      borderRadius: scale(isTab ? 16 : 12),
      backgroundColor: theme.colors.backgroundSecondary,
    },
    percentageText: {
      marginLeft: theme.spacing.md,
      fontFamily: theme.fonts.semiBold,
      width: scale(isTab ? 54 : 44), // Fixed width to avoid layout shifts
      textAlign: 'right',
      letterSpacing: 0.3,
    } as TextStyle,
  });
});

export default ProgressBar;