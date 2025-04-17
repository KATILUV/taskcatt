import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput
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
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center', 
      marginBottom: 16,
    },
    headerContent: {
      flex: 1,
      paddingHorizontal: 12,
    },
    title: {
      ...theme.typography.h6,
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    completedText: {
      textDecorationLine: 'line-through',
      color: theme.colors.textDisabled,
    },
    titleInput: {
      ...theme.typography.h6,
      padding: 0,
      paddingVertical: 8,
      marginBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary,
    },
    date: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
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
    },
    checkedBox: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    iconButton: {
      width: scale(isTab ? 40 : 34),
      height: scale(isTab ? 40 : 34),
      borderRadius: scale(isTab ? 20 : 17),
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.backgroundSecondary,
      marginVertical: 16,
    },
    details: {
      marginTop: 8,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backgroundSecondary,
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      ...theme.typography.subtitle2,
      color: theme.colors.textSecondary,
      marginLeft: 8,
    },
    valueText: {
      ...theme.typography.body2,
      color: theme.colors.textPrimary,
    },
    categoryBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: scale(isTab ? 6 : 4),
      borderRadius: scale(isTab ? 16 : 12),
    },
    categoryText: {
      ...theme.typography.caption,
      fontFamily: theme.fonts.medium,
    },
    priorityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: scale(isTab ? 6 : 4),
      borderRadius: scale(isTab ? 16 : 12),
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
    editForm: {
      marginTop: 8,
    },
    formSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      ...theme.typography.subtitle2,
      color: theme.colors.textPrimary,
      marginBottom: 12,
    },
    historySection: {
      marginTop: 24,
    },
    historyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingVertical: 4,
    },
    historyText: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginLeft: 8,
    },
  });
});

export default TaskDetail;