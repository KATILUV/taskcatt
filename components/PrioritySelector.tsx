import React from 'react';
import { 
  View, 
  StyleSheet, 
  TextStyle
} from 'react-native';
import {
  Text,
  Chip,
  SegmentedButtons,
  useTheme as usePaperTheme,
  TouchableRipple
} from 'react-native-paper';
import { TaskPriority } from '../models/Task';
import { useTheme, createStyles } from '../utils/Theme';
import { scale, scaleFont, isTablet } from '../utils/ResponsiveUtils';

interface PrioritySelectorProps {
  selectedPriority: TaskPriority;
  onSelectPriority: (priority: TaskPriority) => void;
  showLabel?: boolean;
}

export default function PrioritySelector({ 
  selectedPriority, 
  onSelectPriority,
  showLabel = true 
}: PrioritySelectorProps) {
  const { theme } = useTheme();
  const styles = useStyles();
  
  // Get color for a priority
  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'High':
        return theme.colors.priorityHigh;
      case 'Medium':
        return theme.colors.priorityMedium;
      case 'Low':
        return theme.colors.priorityLow;
      default:
        return theme.colors.gray;
    }
  };

  // Get Paper theme
  const paperTheme = usePaperTheme();

  // Handle priority selection
  const handleSelectPriority = (priority: TaskPriority) => {
    onSelectPriority(priority);
  };

  // Create buttons for segmented control
  const buttons = [
    {
      value: 'High',
      label: 'High',
      checkedColor: theme.colors.priorityHigh,
      uncheckedColor: theme.colors.priorityHigh + '80',
      style: { borderColor: theme.colors.priorityHigh }
    },
    {
      value: 'Medium',
      label: 'Medium',
      checkedColor: theme.colors.priorityMedium,
      uncheckedColor: theme.colors.priorityMedium + '80',
      style: { borderColor: theme.colors.priorityMedium }
    },
    {
      value: 'Low',
      label: 'Low',
      checkedColor: theme.colors.priorityLow,
      uncheckedColor: theme.colors.priorityLow + '80',
      style: { borderColor: theme.colors.priorityLow }
    }
  ];

  return (
    <View style={styles.container}>
      {showLabel && <Text variant="bodyLarge" style={styles.label}>Priority:</Text>}
      
      <SegmentedButtons
        value={selectedPriority}
        onValueChange={value => handleSelectPriority(value as TaskPriority)}
        buttons={buttons}
        style={styles.segmentedButtons}
        density="medium"
      />
    </View>
  );
}

const useStyles = createStyles((theme) => {
  const isTab = isTablet();
  
  return StyleSheet.create({
    container: {
      marginVertical: theme.spacing.md,
    },
    label: {
      marginBottom: theme.spacing.sm,
      color: theme.colors.textPrimary,
    } as TextStyle,
    segmentedButtons: {
      marginTop: theme.spacing.sm,
    },
  });
});