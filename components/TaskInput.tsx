import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  View, 
  TouchableOpacity, 
  Text, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { TaskCategory, TaskPriority } from '../models/Task';
import CategorySelector from './CategorySelector';
import PrioritySelector from './PrioritySelector';

interface TaskInputProps {
  onAddTask: (title: string, category: TaskCategory, priority: TaskPriority) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('Personal');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('Medium');

  const handleAddTask = () => {
    if (taskTitle.trim() !== '') {
      onAddTask(taskTitle.trim(), selectedCategory, selectedPriority);
      setTaskTitle('');
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
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={taskTitle}
          onChangeText={setTaskTitle}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <TouchableOpacity 
          style={[
            styles.addButton,
            !taskTitle.trim() && styles.disabledButton
          ]}
          onPress={handleAddTask}
          disabled={!taskTitle.trim()}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'white',
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 22,
    paddingHorizontal: 20,
    fontSize: 16,
    marginRight: 12,
  },
  addButton: {
    height: 44,
    width: 44,
    backgroundColor: '#0066cc',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  spacing: {
    height: 12,
  },
});

export default TaskInput;