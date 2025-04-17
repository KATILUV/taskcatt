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
    backgroundColor: theme.colors.white,
  } as ViewStyle,
  categoryContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  } as ViewStyle,
  advancedContainer: {
    maxHeight: 300,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  } as ViewStyle,
  inputContainer: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  } as ViewStyle,
  inputRow: {
    flexDirection: 'row',
    width: '100%',
  } as ViewStyle,
  input: {
    flex: 1,
    height: 44,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 22,
    paddingHorizontal: 20,
    fontSize: scaleFont(16),
    marginRight: 12,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.body1.fontFamily,
  } as TextStyle,
  addButton: {
    height: 44,
    width: 44,
    backgroundColor: theme.colors.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  disabledButton: {
    backgroundColor: theme.colors.gray,
  } as ViewStyle,
  addButtonText: {
    color: theme.colors.white,
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    fontFamily: theme.typography.button.fontFamily,
  } as TextStyle,
  spacing: {
    height: 12,
  } as ViewStyle,
  advancedToggle: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 4,
  } as ViewStyle,
  advancedToggleText: {
    color: theme.colors.primary,
    fontSize: scaleFont(14),
    fontWeight: '500',
    fontFamily: theme.typography.button.fontFamily,
    letterSpacing: theme.typography.button.letterSpacing,
  } as TextStyle,
  advancedToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  advancedToggleIcon: {
    marginRight: 4
  } as ViewStyle
}));

export default TaskInput;