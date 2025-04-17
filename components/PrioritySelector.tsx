import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { TaskPriority } from '../models/Task';

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
  
  // Get color for a priority
  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'High':
        return '#E53935'; // Red
      case 'Medium':
        return '#FB8C00'; // Orange
      case 'Low':
        return '#43A047'; // Green
      default:
        return '#757575'; // Gray
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

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
});