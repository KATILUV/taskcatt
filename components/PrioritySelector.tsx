import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TaskPriority, TASK_PRIORITIES } from '../models/Task';

interface PrioritySelectorProps {
  selectedPriority: TaskPriority;
  onSelectPriority: (priority: TaskPriority) => void;
  showLabel?: boolean;
}

export default function PrioritySelector({ 
  selectedPriority, 
  onSelectPriority,
  showLabel = false
}: PrioritySelectorProps) {
  
  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'High': return '#f44336';  // Red
      case 'Medium': return '#FF9800'; // Orange
      case 'Low': return '#4CAF50';    // Green
      default: return '#757575';      // Grey
    }
  };
  
  const getPriorityIcon = (priority: TaskPriority): string => {
    switch (priority) {
      case 'High': return 'flag';
      case 'Medium': return 'flag-outline';
      case 'Low': return 'flag-variant-outline';
      default: return 'flag-off-outline';
    }
  };
  
  const renderPriorityBadge = (priority: TaskPriority, isSelected: boolean) => {
    return (
      <TouchableOpacity
        key={priority}
        style={[
          styles.priorityBadge,
          { backgroundColor: getPriorityColor(priority) },
          isSelected && styles.selectedBadge
        ]}
        onPress={() => handleSelectPriority(priority)}
      >
        <MaterialCommunityIcons 
          name={getPriorityIcon(priority)} 
          size={24} 
          color="white" 
        />
        {showLabel && <Text style={styles.priorityLabel}>{priority}</Text>}
      </TouchableOpacity>
    );
  };
  
  const handleSelectPriority = (priority: TaskPriority) => {
    onSelectPriority(priority);
  };
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {TASK_PRIORITIES.map(priority => 
        renderPriorityBadge(priority, priority === selectedPriority)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    minWidth: 44,
  },
  selectedBadge: {
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  priorityLabel: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  }
});