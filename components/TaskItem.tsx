import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Task, TaskCategory, TaskPriority } from '../models/Task';
import { isTablet, scale, scaleFont } from '../utils/ResponsiveUtils';
import { createStyles, theme } from '../utils/Theme';

interface TaskItemProps {
  task: Task;
  drag: () => void;
  isActive: boolean;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  drag, 
  isActive, 
  onDelete,
  onToggleComplete
}) => {
  const getCategoryColor = (category: TaskCategory): string => {
    switch (category) {
      case 'Health':
        return theme.colors.categoryHealth + '80'; // With opacity
      case 'Work':
        return theme.colors.categoryWork + '80'; // With opacity
      case 'Personal':
        return theme.colors.categoryPersonal + '80'; // With opacity
      case 'Other':
      default:
        return theme.colors.categoryOther + '80'; // With opacity
    }
  };
  
  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'High':
        return theme.colors.priorityHigh + '80'; // With opacity
      case 'Medium':
        return theme.colors.priorityMedium + '80'; // With opacity
      case 'Low':
        return theme.colors.priorityLow + '80'; // With opacity
      default:
        return theme.colors.secondary + '80'; // With opacity
    }
  };
  return (
    <TouchableOpacity
      onLongPress={drag}
      style={[
        styles.taskContainer,
        isActive && styles.activeTask,
        task.completed && styles.completedTask
      ]}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={[styles.checkbox, task.completed && styles.checkedBox]}
        onPress={() => onToggleComplete(task.id)}
      >
        {task.completed && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.textContainer}>
        <Text 
          style={[
            styles.taskTitle, 
            task.completed && styles.completedText
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        <View style={styles.detailsContainer}>
          {task.category && (
            <View style={[
              styles.categoryBadge, 
              { backgroundColor: getCategoryColor(task.category) }
            ]}>
              <Text style={styles.categoryText}>{task.category}</Text>
            </View>
          )}
          {task.priority && (
            <View style={[
              styles.priorityBadge, 
              { backgroundColor: getPriorityColor(task.priority) }
            ]}>
              <Text style={styles.priorityText}>{task.priority}</Text>
            </View>
          )}
          {task.completed && (
            <Text style={styles.completedLabel}>Completed</Text>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Use createStyles from Theme utils to create responsive styles
const styles = createStyles((theme) => {
  const isTab = isTablet();
  
  return StyleSheet.create({
    taskContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      marginVertical: theme.spacing.sm,
      marginHorizontal: theme.spacing.md,
      padding: theme.layout.cardPadding,
      borderRadius: theme.layout.cardRadius,
      ...theme.shadows.small,
      height: theme.layout.listItemHeight,
    },
    activeTask: {
      backgroundColor: '#f0f9ff',
      ...theme.shadows.medium,
      transform: [{ scale: 1.03 }],
    },
    completedTask: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderLeftWidth: scale(4),
      borderLeftColor: theme.colors.success,
    },
    textContainer: {
      flex: 1,
      paddingHorizontal: theme.spacing.sm,
    },
    detailsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: theme.spacing.xs,
    },
    taskTitle: {
      fontSize: scaleFont(isTab ? 18 : 16),
      color: theme.colors.textPrimary,
    },
    completedText: {
      textDecorationLine: 'line-through',
      color: theme.colors.textDisabled,
    },
    categoryBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: scale(isTab ? 3 : 2),
      borderRadius: scale(isTab ? 14 : 12),
      marginRight: theme.spacing.sm,
    },
    categoryText: {
      fontSize: scaleFont(isTab ? 13 : 11),
      fontWeight: '500',
      color: theme.colors.textPrimary,
    },
    priorityBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: scale(isTab ? 3 : 2),
      borderRadius: scale(isTab ? 14 : 12),
      marginRight: theme.spacing.sm,
    },
    priorityText: {
      fontSize: scaleFont(isTab ? 13 : 11),
      fontWeight: '500',
      color: theme.colors.textPrimary,
    },
    completedLabel: {
      fontSize: scaleFont(isTab ? 14 : 12),
      color: theme.colors.success,
    },
    checkbox: {
      width: scale(isTab ? 28 : 24),
      height: scale(isTab ? 28 : 24),
      borderRadius: scale(isTab ? 14 : 12),
      borderWidth: 2,
      borderColor: theme.colors.primary,
      marginRight: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkedBox: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    checkmark: {
      color: theme.colors.white,
      fontSize: scaleFont(isTab ? 18 : 16),
      fontWeight: 'bold',
    },
    deleteButton: {
      width: scale(isTab ? 36 : 30),
      height: scale(isTab ? 36 : 30),
      borderRadius: scale(isTab ? 18 : 15),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ffeeee',
    },
    deleteButtonText: {
      fontSize: scaleFont(isTab ? 24 : 20),
      color: theme.colors.error,
      fontWeight: 'bold',
    },
  });
});

export default TaskItem;