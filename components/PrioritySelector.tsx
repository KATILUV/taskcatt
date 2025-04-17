import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextStyle
} from 'react-native';
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

  // Render a badge for a priority
  const renderPriorityBadge = (priority: TaskPriority, isSelected: boolean) => {
    const backgroundColor = isSelected 
      ? getPriorityColor(priority) 
      : 'transparent';
    
    const borderColor = getPriorityColor(priority);
    
    const textColor = isSelected
      ? 'white'
      : getPriorityColor(priority);
    
    return (
      <TouchableOpacity
        key={priority}
        style={[
          styles.badge,
          { backgroundColor, borderColor }
        ]}
        onPress={() => handleSelectPriority(priority)}
      >
        <Text style={[styles.badgeText, { color: textColor }]}>
          {priority}
        </Text>
      </TouchableOpacity>
    );
  };

  // Handle priority selection
  const handleSelectPriority = (priority: TaskPriority) => {
    onSelectPriority(priority);
  };

  return (
    <View style={styles.container}>
      {showLabel && <Text style={styles.label}>Priority:</Text>}
      <View style={styles.badgeContainer}>
        {(['High', 'Medium', 'Low'] as TaskPriority[]).map(priority => 
          renderPriorityBadge(priority, selectedPriority === priority)
        )}
      </View>
    </View>
  );
}

const useStyles = createStyles((theme) => {
  const isTab = isTablet();
  
  return StyleSheet.create({
    container: {
      marginVertical: scale(8),
    },
    label: {
      fontSize: scaleFont(16),
      fontWeight: '500',
      marginBottom: scale(8),
      color: theme.colors.textPrimary,
    } as TextStyle,
    badgeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    badge: {
      paddingHorizontal: scale(12),
      paddingVertical: scale(6),
      borderRadius: scale(16),
      marginRight: scale(8),
      marginBottom: scale(8),
      borderWidth: 1.5,
    },
    badgeText: {
      fontSize: scaleFont(14),
      fontWeight: '500',
    } as TextStyle,
  });
});