import React, { memo, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle, TextStyle, Animated, Easing } from 'react-native';
import { 
  Card, 
  Text, 
  Checkbox, 
  IconButton, 
  Chip,
  useTheme as usePaperTheme,
} from 'react-native-paper';
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

// Use memo to prevent unnecessary re-renders of task items
const TaskItem = memo(({ 
  task, 
  drag, 
  isActive, 
  onDelete,
  onToggleComplete
}: TaskItemProps) => {
  // Get theme from context
  const { theme } = useTheme();
  
  // Memoize color functions to prevent recalculations on re-renders
  const getCategoryColor = useCallback((category: TaskCategory): string => {
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
  }, [theme.colors]);
  
  const getPriorityColor = useCallback((priority: TaskPriority): string => {
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
  }, [theme.colors]);
  
  // Format due date if it exists (using instanceDate for recurring tasks or reminder date)
  const getDueDate = useCallback((): string | null => {
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
  }, [task.instanceDate, task.reminder?.reminderDate]);
  
  // Pre-calculate values outside of render for better performance
  const dueDate = getDueDate();
  const categoryColor = task.category ? getCategoryColor(task.category) : '';
  const priorityColor = task.priority ? getPriorityColor(task.priority) : '';
  
  // Memoize task interaction handlers
  const handleToggleComplete = useCallback(() => {
    onToggleComplete(task.id);
  }, [task.id, onToggleComplete]);
  
  const handleDelete = useCallback(() => {
    onDelete(task.id);
  }, [task.id, onDelete]);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const checkboxScaleAnim = useRef(new Animated.Value(1)).current;
  const checkmarkScaleAnim = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  
  // Toggle animation when completion status changes
  useEffect(() => {
    if (task.completed) {
      // Scale up checkbox
      Animated.sequence([
        Animated.timing(checkboxScaleAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.bezier(0.175, 0.885, 0.32, 1.275), // Elastic bounce effect
        }),
        Animated.timing(checkboxScaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
      
      // Show checkmark with bounce effect
      Animated.spring(checkmarkScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } else {
      // Hide checkmark
      Animated.timing(checkmarkScaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [task.completed, checkboxScaleAnim, checkmarkScaleAnim]);
  
  // Press animation handlers
  const handlePressIn = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [scaleAnim]);
  
  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);
  
  // Delete animation
  const handleDeleteWithAnimation = useCallback(() => {
    Animated.sequence([
      // Subtle shake effect
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.98, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.01, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.98, duration: 100, useNativeDriver: true })
      ]),
      // Fade out
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      })
    ]).start(() => {
      handleDelete();
    });
  }, [scaleAnim, opacityAnim, handleDelete]);
  
  // Access Paper theme
  const paperTheme = usePaperTheme();
  
  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim
      }}
    >
      <TouchableOpacity
        activeOpacity={0.99} // High value to let our custom animation handle the feedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={drag}
        delayLongPress={200}
      >
        <Card
          mode="elevated"
          style={[
            styles.taskCard,
            isActive && styles.activeCard,
            task.completed && styles.completedCard
          ]}
        >
          <Card.Content style={styles.cardHeader}>
            <Animated.View style={{
              transform: [{ scale: checkboxScaleAnim }]
            }}>
              <Checkbox
                status={task.completed ? 'checked' : 'unchecked'}
                color={task.completed ? theme.colors.success : theme.colors.primary}
                onPress={handleToggleComplete}
              />
            </Animated.View>
            
            <Text 
              variant="titleMedium"
              style={[
                styles.taskTitle, 
                task.completed && styles.completedText
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            
            <IconButton
              icon="trash-can-outline"
              iconColor={theme.colors.error}
              size={scaleFont(isTablet() ? 20 : 18)}
              onPress={handleDeleteWithAnimation}
              style={styles.deleteButton}
            />
          </Card.Content>
          
          <Card.Content style={styles.cardContent}>
            <View style={styles.badgeContainer}>
              {task.priority && (
                <Chip 
                  mode="outlined"
                  style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}
                  textStyle={{ color: priorityColor }}
                  icon={({ size }) => (
                    <View style={[
                      styles.priorityIndicator, 
                      { backgroundColor: priorityColor }
                    ]} />
                  )}
                >
                  {task.priority}
                </Chip>
              )}
              
              {task.category && (
                <Chip
                  mode="outlined"
                  style={[styles.categoryBadge, { backgroundColor: categoryColor + '15' }]}
                  textStyle={{ color: categoryColor }}
                >
                  {task.category}
                </Chip>
              )}
            </View>
          </Card.Content>
          
          <Card.Actions style={styles.cardFooter}>
            {dueDate && (
              <Chip
                icon="calendar"
                compact
                style={styles.dueDateChip}
                textStyle={styles.dueDateText}
              >
                Due: {dueDate}
              </Chip>
            )}
            
            <View style={styles.metaContainer}>
              {RecurrenceService.isRecurring(task) && (
                <Chip 
                  icon="sync-outline"
                  compact
                  style={styles.recurrenceContainer}
                  textStyle={styles.recurrenceText}
                >
                  {task.recurrence?.pattern === 'Daily' ? 'Daily' : 
                   task.recurrence?.pattern === 'Weekly' ? 'Weekly' : 
                   task.recurrence?.pattern === 'Monthly' ? 'Monthly' : 
                   'Recurring'}
                </Chip>
              )}
              
              {task.reminder?.enabled && !dueDate && (
                <Chip
                  icon="bell-outline"
                  compact
                  style={styles.reminderContainer}
                  textStyle={styles.reminderText}
                >
                  Reminder
                </Chip>
              )}
              
              {task.completed && (
                <Chip
                  icon="check-circle"
                  compact
                  style={styles.completedContainer}
                  textStyle={styles.completedLabel}
                >
                  Completed
                </Chip>
              )}
            </View>
          </Card.Actions>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
});

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
    dueDateChip: {
      backgroundColor: theme.colors.backgroundSecondary + '50',
      borderColor: theme.colors.backgroundSecondary,
    } as ViewStyle,
    dueDateText: {
      ...(theme.typography.caption as TextStyle),
      color: theme.colors.textSecondary,
      fontWeight: '500',
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