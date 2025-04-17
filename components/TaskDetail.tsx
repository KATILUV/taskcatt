import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView,
  TextStyle
} from 'react-native';
import {
  Text,
  Checkbox,
  IconButton,
  Card,
  TextInput,
  Divider,
  Surface,
  Chip,
  Badge,
  Button,
  Avatar,
  Title,
  Subheading,
  Caption,
  List,
  useTheme as usePaperTheme
} from 'react-native-paper';
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
  
  // Access Paper theme
  const paperTheme = usePaperTheme();

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.header}>
          <Checkbox
            status={task.completed ? 'checked' : 'unchecked'}
            onPress={() => onToggleComplete(task.id)}
            color={theme.colors.success}
          />
          
          <View style={styles.headerContent}>
            {isEditing ? (
              <TextInput
                mode="outlined"
                label="Task title"
                value={title}
                onChangeText={setTitle}
                style={styles.titleInput}
                outlineColor={theme.colors.primary}
                activeOutlineColor={theme.colors.primary}
                dense
              />
            ) : (
              <Title 
                style={[
                  styles.title, 
                  task.completed && styles.completedText
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Title>
            )}
            
            <Caption style={styles.date}>
              Created {formatDate(task.createdAt)}
            </Caption>
          </View>
          
          <View style={styles.actionsContainer}>
            {isEditing ? (
              <IconButton
                icon="check-circle"
                iconColor={theme.colors.success}
                style={{backgroundColor: theme.colors.success + '20'}}
                size={24}
                onPress={handleSave}
              />
            ) : (
              <IconButton
                icon="pencil"
                iconColor={theme.colors.primary}
                style={{backgroundColor: theme.colors.primary + '20'}}
                size={20}
                onPress={() => setIsEditing(true)}
              />
            )}
            
            <IconButton
              icon="trash-can-outline"
              iconColor={theme.colors.error}
              style={{backgroundColor: theme.colors.error + '20'}}
              size={20}
              onPress={() => onDelete(task.id)}
            />
          </View>
        </Card.Content>
      </Card>
      
      <Divider style={styles.divider} />
      
      {isEditing ? (
        <Card style={styles.editForm}>
          <Card.Content>
            <View style={styles.formSection}>
              <Subheading style={styles.sectionTitle}>Category</Subheading>
              <CategorySelector 
                selectedCategory={category}
                onSelectCategory={setCategory}
                showLabel
              />
            </View>
            
            <Divider style={{marginVertical: 16}} />
            
            <View style={styles.formSection}>
              <Subheading style={styles.sectionTitle}>Priority</Subheading>
              <PrioritySelector 
                selectedPriority={priority}
                onSelectPriority={setPriority}
                showLabel
              />
            </View>
            
            <Divider style={{marginVertical: 16}} />
            
            <View style={styles.formSection}>
              <Subheading style={styles.sectionTitle}>Recurrence</Subheading>
              <RecurrenceSelector 
                recurrence={recurrence}
                onRecurrenceChange={setRecurrence}
                showLabel
              />
            </View>
            
            <Divider style={{marginVertical: 16}} />
            
            <View style={styles.formSection}>
              <Subheading style={styles.sectionTitle}>Reminder</Subheading>
              <ReminderSelector 
                reminderSettings={reminder}
                onReminderChange={setReminder}
                showLabel
              />
            </View>
          </Card.Content>
        </Card>
      ) : (
        <Surface style={styles.details}>
          <List.Item
            title="Category"
            left={props => <List.Icon {...props} icon="bookmark-outline" color={theme.colors.textSecondary} />}
            right={props => (
              <Chip
                mode="outlined"
                style={[
                  styles.categoryChip, 
                  { backgroundColor: getCategoryColor(task.category) + '20' }
                ]}
                textStyle={{ color: getCategoryColor(task.category) }}
              >
                {task.category}
              </Chip>
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Priority"
            left={props => <List.Icon {...props} icon="flag-outline" color={theme.colors.textSecondary} />}
            right={props => (
              <Chip
                mode="outlined"
                style={[
                  styles.priorityChip, 
                  { backgroundColor: getPriorityColor(task.priority) + '20' }
                ]}
                textStyle={{ color: getPriorityColor(task.priority) }}
              >
                {task.priority}
              </Chip>
            )}
          />
          
          {task.recurrence && (
            <>
              <Divider />
              <List.Item
                title="Recurrence"
                description={
                  task.recurrence.pattern === 'Daily' ? 'Repeats daily' : 
                  task.recurrence.pattern === 'Weekly' ? 'Repeats weekly' : 
                  task.recurrence.pattern === 'Monthly' ? 'Repeats monthly' : 
                  'Custom recurrence pattern'
                }
                left={props => <List.Icon {...props} icon="refresh" color={theme.colors.textSecondary} />}
              />
            </>
          )}
          
          {task.reminder?.enabled && (
            <>
              <Divider />
              <List.Item
                title="Reminder"
                description={task.reminder.reminderDate ? formatDate(task.reminder.reminderDate) : 'Enabled'}
                left={props => <List.Icon {...props} icon="bell-outline" color={theme.colors.textSecondary} />}
              />
            </>
          )}
          
          {task.completed && task.completionHistory && task.completionHistory.length > 0 && (
            <Card style={styles.historyCard}>
              <Card.Title title="Completion History" />
              <Card.Content>
                {task.completionHistory.map((record, index) => (
                  <List.Item
                    key={index}
                    title={formatDate(record.date)}
                    left={props => <List.Icon {...props} icon="check-circle" color={theme.colors.success} />}
                    style={styles.historyItem}
                  />
                ))}
              </Card.Content>
            </Card>
          )}
        </Surface>
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
    card: {
      marginHorizontal: 0,
      marginVertical: theme.spacing.sm,
      elevation: 2,
      backgroundColor: theme.colors.backgroundCard,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center', 
      paddingVertical: 0,
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
      fontSize: scaleFont(16),
      backgroundColor: 'transparent',
      marginVertical: 0,
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
      height: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    details: {
      marginTop: theme.spacing.md,
      borderRadius: 8,
      overflow: 'hidden',
      elevation: 1,
      backgroundColor: theme.colors.backgroundCard,
    },
    categoryChip: {
      height: 32,
      borderWidth: 1,
      margin: 0,
    },
    priorityChip: {
      height: 32,
      borderWidth: 1,
      margin: 0,
    },
    historyCard: {
      marginTop: theme.spacing.lg,
      marginHorizontal: theme.spacing.sm,
      elevation: 1,
      backgroundColor: theme.colors.backgroundCard,
    },
    editForm: {
      marginTop: theme.spacing.md,
      marginHorizontal: 0,
      elevation: 1,
      backgroundColor: theme.colors.backgroundCard,
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