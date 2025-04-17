import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  View, 
  TouchableOpacity, 
  Text, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Pressable,
  TextStyle,
  ViewStyle
} from 'react-native';
import { 
  TaskCategory, 
  TaskPriority, 
  RecurrenceSettings, 
  ReminderSettings
} from '../models/Task';
import CategorySelector from './CategorySelector';
import PrioritySelector from './PrioritySelector';
import RecurrenceSelector from './RecurrenceSelector';
import ReminderSelector from './ReminderSelector';
import { createStyles, useTheme } from '../utils/Theme';
import { scale, scaleFont } from '../utils/ResponsiveUtils';
import { IconButton } from './IconButton';
import { Ionicons } from '@expo/vector-icons';

interface TaskInputProps {
  onAddTask: (
    title: string, 
    category: TaskCategory, 
    priority: TaskPriority, 
    recurrence?: RecurrenceSettings,
    reminder?: ReminderSettings
  ) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('Personal');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('Medium');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceSettings | undefined>(undefined);
  const [reminder, setReminder] = useState<ReminderSettings | undefined>(undefined);
  
  // Get theme from context
  const { theme } = useTheme();

  const handleAddTask = () => {
    if (taskTitle.trim() !== '') {
      onAddTask(
        taskTitle.trim(), 
        selectedCategory, 
        selectedPriority,
        recurrence,
        reminder
      );
      setTaskTitle('');
      // Reset advanced options if they were set
      if (recurrence || reminder) {
        setRecurrence(undefined);
        setReminder(undefined);
        setShowAdvanced(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.categoryContainer}>
        <CategorySelector 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <View style={styles.spacing} />
        <PrioritySelector
          selectedPriority={selectedPriority}
          onSelectPriority={setSelectedPriority}
        />
      </View>
      
      {showAdvanced && (
        <ScrollView style={styles.advancedContainer}>
          <RecurrenceSelector 
            recurrence={recurrence}
            onRecurrenceChange={setRecurrence}
          />
          <ReminderSelector
            reminderSettings={reminder}
            onReminderChange={setReminder}
          />
        </ScrollView>
      )}
      
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a new task..."
            value={taskTitle}
            onChangeText={setTaskTitle}
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
          />
          <IconButton
            name="add"
            variant={taskTitle.trim() ? 'primary' : 'secondary'}
            onPress={handleAddTask}
            disabled={!taskTitle.trim()}
            size="medium"
          />
        </View>
        
        <Pressable 
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <View style={styles.advancedToggleContent}>
            <Ionicons 
              name={showAdvanced ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={theme.colors.primary} 
              style={styles.advancedToggleIcon}
            />
            <Text style={styles.advancedToggleText}>
              {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
            </Text>
          </View>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = createStyles((theme) => StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: theme.colors.backgroundCard,
  } as ViewStyle,
  categoryContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.backgroundSecondary,
  } as ViewStyle,
  advancedContainer: {
    maxHeight: 320,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.backgroundSecondary,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  } as ViewStyle,
  inputContainer: {
    flexDirection: 'column',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: theme.colors.backgroundSecondary,
  } as ViewStyle,
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  } as ViewStyle,
  input: {
    flex: 1,
    height: 48,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: scaleFont(16),
    marginRight: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.medium,
    fontWeight: '500',
    letterSpacing: 0.15,
  } as TextStyle,
  addButton: {
    height: 48,
    width: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  } as ViewStyle,
  disabledButton: {
    backgroundColor: theme.colors.gray,
  } as ViewStyle,
  addButtonText: {
    color: theme.colors.white,
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  } as TextStyle,
  spacing: {
    height: theme.spacing.md,
  } as ViewStyle,
  advancedToggle: {
    alignSelf: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 20,
  } as ViewStyle,
  advancedToggleText: {
    color: theme.colors.primary,
    fontSize: scaleFont(14),
    fontWeight: '600',
    fontFamily: theme.fonts.semiBold,
    letterSpacing: 0.5,
  } as TextStyle,
  advancedToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  advancedToggleIcon: {
    marginRight: theme.spacing.xs
  } as ViewStyle
}));

export default TaskInput;