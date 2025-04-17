import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 12,
  showPercentage = true,
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  
  // Calculate color based on progress
  const getProgressColor = () => {
    if (normalizedProgress < 30) return '#FF6B6B'; // Red for low progress
    if (normalizedProgress < 70) return '#FFD166'; // Amber for medium progress
    return '#06D6A0'; // Green for high progress
  };

  const progressColor = getProgressColor();
  
  const progressFillStyle = {
    width: `${normalizedProgress}%`,
    height: '100%',
    backgroundColor: progressColor,
    borderRadius: 10,
  };

  return (
    <View style={styles.container}>
      <View style={[styles.progressBackground, { height }]}>
        <View style={progressFillStyle} />
      </View>
      
      {showPercentage && (
        <Text style={[styles.percentageText, { color: progressColor }]}>
          {normalizedProgress}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  progressBackground: {
    backgroundColor: '#E9ECEF',
    borderRadius: 10,
    overflow: 'hidden',
    flex: 1,
  },
  progressFill: {
    borderRadius: 10,
  },
  percentageText: {
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 14,
    width: 40, // Fixed width to avoid layout shifts
    textAlign: 'right',
  },
});

export default ProgressBar;