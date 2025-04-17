import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { 
  Task, 
  TaskCategory, 
  TaskPriority,
  RecurrencePattern 
} from '../models/Task';
import { RecurrenceService } from '../services/RecurrenceService'; 
import { isTablet, scale, scaleFont } from '../utils/ResponsiveUtils';
import { createStyles, useTheme } from '../utils/Theme';
import { Ionicons } from '@expo/vector-icons';

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
  // Get theme from context
  const { theme } = useTheme();
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
            <Ionicons 
              name="checkmark-sharp" 
              size={scaleFont(isTablet() ? 18 : 16)} 
              color={theme.colors.white} 
            />
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
          <Ionicons 
            name="trash-outline" 
            size={scaleFont(isTablet() ? 18 : 16)} 
            color={theme.colors.error} 
          />
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
            <Ionicons 
              name="calendar-outline" 
              size={scaleFont(isTablet() ? 16 : 14)} 
              color={theme.colors.textSecondary} 
              style={{marginRight: scale(4)}} 
            />
            <Text style={styles.dueDateText}>Due: {dueDate}</Text>
          </View>
        )}
        
        <View style={styles.metaContainer}>
          {RecurrenceService.isRecurring(task) && (
            <View style={styles.recurrenceContainer}>
              <Ionicons 
                name="sync-outline" 
                size={scaleFont(isTablet() ? 16 : 14)} 
                color={theme.colors.primary} 
                style={{marginRight: scale(4)}} 
              />
              <Text style={styles.recurrenceText}>
                {task.recurrence?.pattern === 'Daily' ? 'Daily' : 
                 task.recurrence?.pattern === 'Weekly' ? 'Weekly' : 
                 task.recurrence?.pattern === 'Monthly' ? 'Monthly' : 
                 'Recurring'}
              </Text>
            </View>
          )}
          
          {task.reminder?.enabled && !dueDate && (
            <View style={styles.reminderContainer}>
              <Ionicons 
                name="notifications-outline" 
                size={scaleFont(isTablet() ? 16 : 14)} 
                color={theme.colors.warning} 
                style={{marginRight: scale(4)}} 
              />
              <Text style={styles.reminderText}>Reminder set</Text>
            </View>
          )}
          
          {task.completed && (
            <View style={styles.completedContainer}>
              <Ionicons 
                name="checkmark-circle" 
                size={scaleFont(isTablet() ? 16 : 14)} 
                color={theme.colors.success} 
                style={{marginRight: scale(4)}} 
              />
              <Text style={styles.completedLabel}>Completed</Text>
            </View>
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
      marginVertical: theme.spacing.md + 4,
      marginHorizontal: theme.spacing.lg,
      borderRadius: theme.layout.cardRadius * 2,
      ...theme.shadows.medium,
      overflow: 'hidden',
      minHeight: theme.layout.listItemHeight * 1.2,
    },
    activeCard: {
      backgroundColor: theme.colors.white,
      ...theme.shadows.large,
      transform: [{ scale: 1.03 }],
    },
    completedCard: {
      backgroundColor: theme.colors.backgroundSecondary + '30',
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.success,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backgroundSecondary,
    },
    cardContent: {
      padding: theme.spacing.lg,
      paddingVertical: theme.spacing.md + 4,
    },
    cardFooter: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
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
    // Removed unused checkmark style
    taskTitle: {
      flex: 1,
      ...(theme.typography.subtitle1 as TextStyle),
      color: theme.colors.textPrimary,
      fontFamily: theme.fonts.semiBold,
      fontWeight: '600',
      letterSpacing: 0.1,
    } as TextStyle,
    completedText: {
      textDecorationLine: 'line-through',
      color: theme.colors.textDisabled,
      fontWeight: '400',
      fontFamily: theme.fonts.regular,
    } as TextStyle,
    deleteButton: {
      width: scale(isTab ? 36 : 30),
      height: scale(isTab ? 36 : 30),
      borderRadius: scale(isTab ? 18 : 15),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.errorLight + '30',
    },
    // Removed unused deleteButtonText style - using Ionicons instead
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
      ...(theme.typography.caption as TextStyle),
      fontFamily: theme.fonts.medium,
      fontWeight: '500',
      letterSpacing: 0.4,
      fontSize: scaleFont(12),
    } as TextStyle,
    categoryBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: scale(isTab ? 6 : 4),
      borderRadius: scale(isTab ? 16 : 12),
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    categoryText: {
      ...(theme.typography.caption as TextStyle),
      fontFamily: theme.fonts.medium,
      fontWeight: '500',
      letterSpacing: 0.4,
      fontSize: scaleFont(12),
    } as TextStyle,
    dueDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,
    dueDateText: {
      ...(theme.typography.caption as TextStyle),
      color: theme.colors.textSecondary,
      fontWeight: '400',
      letterSpacing: 0.25,
      fontSize: scaleFont(11),
    } as TextStyle,
    metaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    } as ViewStyle,
    recurrenceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: theme.spacing.sm,
    } as ViewStyle,
    recurrenceText: {
      ...(theme.typography.caption as TextStyle),
      color: theme.colors.primary,
      fontWeight: '500',
      letterSpacing: 0.25,
      fontSize: scaleFont(11),
    } as TextStyle,
    reminderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: theme.spacing.sm,
    } as ViewStyle,
    reminderText: {
      ...(theme.typography.caption as TextStyle),
      color: theme.colors.warning,
      fontWeight: '500',
      letterSpacing: 0.25,
      fontSize: scaleFont(11),
    } as TextStyle,
    completedContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: theme.spacing.sm,
    } as ViewStyle,
    completedLabel: {
      ...(theme.typography.caption as TextStyle),
      color: theme.colors.success,
      fontWeight: '500',
      letterSpacing: 0.25,
      fontSize: scaleFont(11),
    } as TextStyle,
  });
});

export default TaskItem;