import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, TaskCategory, TaskPriority, RecurrenceSettings, ReminderSettings } from '../models/Task';
import { scale, scaleFont, isTablet } from '../utils/ResponsiveUtils';
import { createStyles, useTheme } from '../utils/Theme';
import CategorySelector from './CategorySelector';
import PrioritySelector from './PrioritySelector';
import RecurrenceSelector from './RecurrenceSelector';
import ReminderSelector from './ReminderSelector';

interface TaskDetailProps {
  task: Task;
  onTaskUpdate: (updatedTask: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ 
  task, 
  onTaskUpdate, 
  onDelete,
  onToggleComplete
}) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState<TaskCategory>(task.category);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [recurrence, setRecurrence] = useState<RecurrenceSettings | undefined>(task.recurrence);
  const [reminder, setReminder] = useState<ReminderSettings | undefined>(task.reminder);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    const updatedTask: Task = {
      ...task,
      title,
      category,
      priority,
      recurrence,
      reminder
    };
    
    onTaskUpdate(updatedTask);
    setIsEditing(false);
  };

  const getCategoryColor = (cat: TaskCategory): string => {
    switch (cat) {
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
  
  const getPriorityColor = (pri: TaskPriority): string => {
    switch (pri) {
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

  // Format dates if they exist
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };
  
  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.checkbox, task.completed && styles.checkedBox]}
          onPress={() => onToggleComplete(task.id)}
        >
          {task.completed && (
            <Ionicons 
              name="checkmark" 
              size={scale(isTablet() ? 18 : 16)} 
              color={theme.colors.white} 
            />
          )}
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          {isEditing ? (
            <TextInput
              style={[styles.titleInput, { color: theme.colors.textPrimary }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              placeholderTextColor={theme.colors.textSecondary}
            />
          ) : (
            <Text style={[styles.title, task.completed && styles.completedText]}>
              {task.title}
            </Text>
          )}
          
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
            Created {formatDate(task.createdAt)}
          </Text>
        </View>
        
        <View style={styles.actionsContainer}>
          {isEditing ? (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.colors.success + '20' }]}
              onPress={handleSave}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={theme.colors.success} 
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.colors.primary + '20' }]}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons 
                name="pencil" 
                size={20} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.error + '20' }]}
            onPress={() => onDelete(task.id)}
          >
            <Ionicons 
              name="trash-outline" 
              size={20} 
              color={theme.colors.error} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      {isEditing ? (
        <View style={styles.editForm}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Category</Text>
            <CategorySelector 
              selectedCategory={category}
              onSelectCategory={setCategory}
              showLabel
            />
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Priority</Text>
            <PrioritySelector 
              selectedPriority={priority}
              onSelectPriority={setPriority}
              showLabel
            />
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Recurrence</Text>
            <RecurrenceSelector 
              recurrence={recurrence}
              onRecurrenceChange={setRecurrence}
              showLabel
            />
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Reminder</Text>
            <ReminderSelector 
              reminderSettings={reminder}
              onReminderChange={setReminder}
              showLabel
            />
          </View>
        </View>
      ) : (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Ionicons name="bookmark-outline" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.label}>Category</Text>
            </View>
            <View style={[
              styles.categoryBadge, 
              { backgroundColor: getCategoryColor(task.category) + '20' }
            ]}>
              <Text style={[
                styles.categoryText,
                { color: getCategoryColor(task.category) }
              ]}>
                {task.category}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.labelContainer}>
              <Ionicons name="flag-outline" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.label}>Priority</Text>
            </View>
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
          </View>
          
          {task.recurrence && (
            <View style={styles.detailRow}>
              <View style={styles.labelContainer}>
                <Ionicons name="refresh" size={18} color={theme.colors.textSecondary} />
                <Text style={styles.label}>Recurrence</Text>
              </View>
              <Text style={styles.valueText}>
                {task.recurrence.pattern === 'Daily' ? 'Daily' : 
                 task.recurrence.pattern === 'Weekly' ? 'Weekly' : 
                 task.recurrence.pattern === 'Monthly' ? 'Monthly' : 
                 'Custom'}
              </Text>
            </View>
          )}
          
          {task.reminder?.enabled && (
            <View style={styles.detailRow}>
              <View style={styles.labelContainer}>
                <Ionicons name="notifications-outline" size={18} color={theme.colors.textSecondary} />
                <Text style={styles.label}>Reminder</Text>
              </View>
              <Text style={styles.valueText}>
                {task.reminder.reminderDate ? formatDate(task.reminder.reminderDate) : 'Enabled'}
              </Text>
            </View>
          )}
          
          {task.completed && task.completionHistory && task.completionHistory.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Completion History</Text>
              {task.completionHistory.map((record, index) => (
                <View key={index} style={styles.historyItem}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.historyText}>
                    {formatDate(record.date)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = createStyles((theme) => {
  const isTab = isTablet();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center', 
      marginBottom: theme.spacing.md,
    },
    headerContent: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
    },
    title: {
      fontSize: scaleFont(18),
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.textPrimary,
      marginBottom: 4,
      letterSpacing: 0.15,
    } as TextStyle,
    completedText: {
      textDecorationLine: 'line-through',
      color: theme.colors.textDisabled,
    },
    titleInput: {
      fontSize: scaleFont(18),
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
      padding: 0,
      paddingVertical: theme.spacing.sm,
      marginBottom: 4,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
      letterSpacing: 0.15,
    } as TextStyle,
    date: {
      fontSize: scaleFont(12),
      fontWeight: '400',
      fontFamily: theme.fonts.regular,
      color: theme.colors.textSecondary,
      letterSpacing: 0.4,
      lineHeight: 18,
    } as TextStyle,
    actionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: scale(isTab ? 28 : 24),
      height: scale(isTab ? 28 : 24),
      borderRadius: scale(isTab ? 14 : 12),
      borderWidth: 2,
      borderColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.small,
    },
    checkedBox: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    iconButton: {
      width: scale(isTab ? 40 : 36),
      height: scale(isTab ? 40 : 36),
      borderRadius: scale(isTab ? 20 : 18),
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 10,
      ...theme.shadows.small,
    },
    divider: {
      height: 1.5,
      backgroundColor: theme.colors.backgroundSecondary,
      marginVertical: theme.spacing.md,
    },
    details: {
      marginTop: theme.spacing.sm,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backgroundSecondary,
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      fontSize: scaleFont(16),
      fontWeight: '500',
      fontFamily: theme.fonts.medium,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
      letterSpacing: 0.15,
    } as TextStyle,
    valueText: {
      fontSize: scaleFont(14),
      fontWeight: '500',
      fontFamily: theme.fonts.medium,
      color: theme.colors.textPrimary,
      letterSpacing: 0.1,
    } as TextStyle,
    categoryBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: scale(isTab ? 8 : 6),
      borderRadius: scale(isTab ? 18 : 14),
      ...theme.shadows.small,
    },
    categoryText: {
      fontSize: scaleFont(14),
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
      letterSpacing: 0.1,
    } as TextStyle,
    priorityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: scale(isTab ? 8 : 6),
      borderRadius: scale(isTab ? 18 : 14),
      ...theme.shadows.small,
    },
    priorityIndicator: {
      width: scale(isTab ? 12 : 10),
      height: scale(isTab ? 12 : 10),
      borderRadius: scale(isTab ? 6 : 5),
      marginRight: theme.spacing.xs,
    },
    priorityText: {
      fontSize: scaleFont(14),
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
      letterSpacing: 0.1,
    } as TextStyle,
    editForm: {
      marginTop: theme.spacing.md,
    },
    formSection: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: scaleFont(16),
      fontWeight: '600', 
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      letterSpacing: 0.15,
    } as TextStyle,
    historySection: {
      marginTop: theme.spacing.xl,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.backgroundSecondary,
    },
    historyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.backgroundSecondary + '50',
      borderRadius: 8,
    },
    historyText: {
      fontSize: scaleFont(14),
      fontWeight: '400',
      fontFamily: theme.fonts.regular,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
      letterSpacing: 0.1,
    } as TextStyle,
  });
});

export default TaskDetail;