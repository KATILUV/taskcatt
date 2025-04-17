import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Pressable,
  TextStyle,
  ViewStyle
} from 'react-native';
import { 
  TextInput, 
  Text, 
  Button, 
  IconButton as PaperIconButton,
  Card,
  Divider,
  Surface,
  useTheme as usePaperTheme
} from 'react-native-paper';
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

  // Access Paper theme
  const paperTheme = usePaperTheme();
  
  return (
    <Card style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Card.Content style={styles.categoryContainer}>
          <CategorySelector 
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <View style={styles.spacing} />
          <PrioritySelector
            selectedPriority={selectedPriority}
            onSelectPriority={setSelectedPriority}
          />
        </Card.Content>
        
        <Divider />
        
        {showAdvanced && (
          <Surface style={styles.advancedSurface}>
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
          </Surface>
        )}
        
        <Card.Content style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              mode="outlined"
              style={styles.input}
              placeholder="Add a new task..."
              value={taskTitle}
              onChangeText={setTaskTitle}
              onSubmitEditing={handleAddTask}
              returnKeyType="done"
              right={
                <TextInput.Icon 
                  icon="plus" 
                  disabled={!taskTitle.trim()}
                  onPress={handleAddTask}
                  color={taskTitle.trim() ? theme.colors.primary : theme.colors.gray}
                />
              }
            />
          </View>
          
          <Button
            mode="text"
            onPress={() => setShowAdvanced(!showAdvanced)}
            icon={showAdvanced ? "chevron-up" : "chevron-down"}
            style={styles.advancedToggle}
            labelStyle={styles.advancedToggleText}
          >
            {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
          </Button>
        </Card.Content>
      </KeyboardAvoidingView>
    </Card>
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