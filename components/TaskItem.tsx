import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Task, TaskCategory, TaskPriority } from '../models/Task';

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onPress?: (task: Task) => void;
}

const TaskItem = ({ 
  task, 
  onDelete, 
  onToggleComplete,
  onPress
}: TaskItemProps) => {
  const { id, title, completed, category, priority } = task;

  const getCategoryColor = useCallback((category: TaskCategory): string => {
    switch (category) {
      case 'Health': return '#4CAF50'; // Green
      case 'Work': return '#2196F3';   // Blue
      case 'Personal': return '#FF9800'; // Orange
      case 'Other': return '#9C27B0';  // Purple
      default: return '#757575';      // Grey
    }
  }, []);

  const getPriorityColor = useCallback((priority: TaskPriority): string => {
    switch (priority) {
      case 'High': return '#f44336';  // Red
      case 'Medium': return '#FF9800'; // Orange
      case 'Low': return '#4CAF50';    // Green
      default: return '#757575';      // Grey
    }
  }, []);

  return (
    <TouchableOpacity
      style={[styles.container, completed && styles.completedTask]}
      onPress={() => onPress && onPress(task)}
      activeOpacity={0.7}
    >
      <TouchableOpacity 
        style={[styles.checkbox, completed && styles.checkedBox]}
        onPress={() => onToggleComplete(id)}
      >
        {completed && (
          <MaterialCommunityIcons name="check" size={20} color="white" />
        )}
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text 
          style={[styles.title, completed && styles.completedText]}
          numberOfLines={1}
        >
          {title}
        </Text>
        
        <View style={styles.badges}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(category) }]}>
            <Text style={styles.badgeText}>{category}</Text>
          </View>
          
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(priority) }]}>
            <Text style={styles.badgeText}>{priority}</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDelete(id)}
      >
        <MaterialCommunityIcons name="delete" size={24} color="#757575" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completedTask: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#757575',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkedBox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  badges: {
    flexDirection: 'row',
    marginTop: 4,
  },
  categoryBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  priorityBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
  },
});

export default TaskItem;