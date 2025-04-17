import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { 
  Task, 
  TaskCategory, 
  TaskPriority,
  RecurrencePattern 
} from '../models/Task';
import { RecurrenceService } from '../services/RecurrenceService'; 
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
        return theme.colors.categoryHealth;
      case 'Work':
        return theme.colors.categoryWork;
      case 'Personal':
        return theme.colors.categoryPersonal;
      case 'Other':
      default:
        return theme.colors.categoryOther;
    }
  };
  
  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'High':
        return theme.colors.priorityHigh;
      case 'Medium':
        return theme.colors.priorityMedium;
      case 'Low':
        return theme.colors.priorityLow;
      default:
        return theme.colors.secondary;
    }
  };
  
  // Format due date if it exists (using instanceDate for recurring tasks or reminder date)
  const getDueDate = (): string | null => {
    let dueDate: number | undefined;
    
    if (task.instanceDate) {
      dueDate = task.instanceDate;
    } else if (task.reminder?.reminderDate) {
      dueDate = task.reminder.reminderDate;
    }
    
    if (dueDate) {
      const date = new Date(dueDate);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    }
    
    return null;
  };
  
  const dueDate = getDueDate();
  
  return (
    <TouchableOpacity
      onLongPress={drag}
      style={[
        styles.taskCard,
        isActive && styles.activeCard,
        task.completed && styles.completedCard
      ]}
      activeOpacity={0.8}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={[styles.checkbox, task.completed && styles.checkedBox]}
          onPress={() => onToggleComplete(task.id)}
        >
          {task.completed && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
        
        <Text 
          style={[
            styles.taskTitle, 
            task.completed && styles.completedText
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => onDelete(task.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      
      {/* Card Content */}
      <View style={styles.cardContent}>
        <View style={styles.badgeContainer}>
          {task.priority && (
            <View style={[
              styles.priorityBadge, 
              { backgroundColor: getPriorityColor(task.priority) + '20' }
            ]}>
              <View style={[
                styles.priorityIndicator, 
                { backgroundColor: getPriorityColor(task.priority) }
              ]} />
              <Text style={[
                styles.priorityText,
                { color: getPriorityColor(task.priority) }
              ]}>
                {task.priority}
              </Text>
            </View>
          )}
          
          {task.category && (
            <View style={[
              styles.categoryBadge, 
              { backgroundColor: getCategoryColor(task.category) + '15' }
            ]}>
              <Text style={[
                styles.categoryText,
                { color: getCategoryColor(task.category) }
              ]}>
                {task.category}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Card Footer */}
      <View style={styles.cardFooter}>
        {dueDate && (
          <View style={styles.dueDateContainer}>
            <Text style={styles.dueDateText}>📅 Due: {dueDate}</Text>
          </View>
        )}
        
        <View style={styles.metaContainer}>
          {RecurrenceService.isRecurring(task) && (
            <View style={styles.recurrenceContainer}>
              <Text style={styles.recurrenceText}>
                {task.recurrence?.pattern === 'Daily' ? '🔄 Daily' : 
                 task.recurrence?.pattern === 'Weekly' ? '🔄 Weekly' : 
                 task.recurrence?.pattern === 'Monthly' ? '🔄 Monthly' : 
                 '🔄 Recurring'}
              </Text>
            </View>
          )}
          
          {task.reminder?.enabled && !dueDate && (
            <View style={styles.reminderContainer}>
              <Text style={styles.reminderText}>🔔 Reminder set</Text>
            </View>
          )}
          
          {task.completed && (
            <Text style={styles.completedLabel}>✅ Completed</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Use createStyles from Theme utils to create responsive styles
const styles = createStyles((theme) => {
  const isTab = isTablet();
  
  return StyleSheet.create({
    taskCard: {
      backgroundColor: theme.colors.backgroundCard,
      marginVertical: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      borderRadius: theme.layout.cardRadius * 1.5,
      ...theme.shadows.medium,
      overflow: 'hidden',
      minHeight: theme.layout.listItemHeight * 1.2,
    },
    activeCard: {
      backgroundColor: theme.colors.white,
      ...theme.shadows.large,
      transform: [{ scale: 1.02 }],
    },
    completedCard: {
      backgroundColor: theme.colors.backgroundSecondary + '50',
      borderLeftWidth: scale(4),
      borderLeftColor: theme.colors.success,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backgroundSecondary,
    },
    cardContent: {
      padding: theme.spacing.md,
    },
    cardFooter: {
      padding: theme.spacing.md,
      paddingTop: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
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
    taskTitle: {
      flex: 1,
      ...theme.typography.subtitle1,
      color: theme.colors.textPrimary,
    },
    completedText: {
      textDecorationLine: 'line-through',
      color: theme.colors.textDisabled,
    },
    deleteButton: {
      width: scale(isTab ? 36 : 30),
      height: scale(isTab ? 36 : 30),
      borderRadius: scale(isTab ? 18 : 15),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.errorLight + '30',
    },
    deleteButtonText: {
      fontSize: scaleFont(isTab ? 24 : 20),
      color: theme.colors.error,
      fontWeight: 'bold',
    },
    badgeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    priorityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: scale(isTab ? 6 : 4),
      borderRadius: scale(isTab ? 16 : 12),
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    priorityIndicator: {
      width: scale(isTab ? 10 : 8),
      height: scale(isTab ? 10 : 8),
      borderRadius: scale(isTab ? 5 : 4),
      marginRight: theme.spacing.xs,
    },
    priorityText: {
      ...theme.typography.caption,
      fontFamily: theme.fonts.medium,
    },
    categoryBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: scale(isTab ? 6 : 4),
      borderRadius: scale(isTab ? 16 : 12),
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    categoryText: {
      ...theme.typography.caption,
      fontFamily: theme.fonts.medium,
    },
    dueDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dueDateText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    metaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    recurrenceContainer: {
      marginLeft: theme.spacing.sm,
    },
    recurrenceText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
    },
    reminderContainer: {
      marginLeft: theme.spacing.sm,
    },
    reminderText: {
      ...theme.typography.caption,
      color: theme.colors.warning,
    },
    completedLabel: {
      ...theme.typography.caption,
      color: theme.colors.success,
      marginLeft: theme.spacing.sm,
    },
  });
});

export default TaskItem;