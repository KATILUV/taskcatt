import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Task, TaskCategory, TaskPriority, RecurrenceSettings, ReminderSettings } from '../models/Task';
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

export default function TaskDetail({
  task,
  onTaskUpdate,
  onDelete,
  onToggleComplete,
}: TaskDetailProps) {
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState<TaskCategory>(task.category);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [recurrence, setRecurrence] = useState<RecurrenceSettings | undefined>(task.recurrence);
  const [reminder, setReminder] = useState<ReminderSettings | undefined>(task.reminder);

  const handleSave = () => {
    const updatedTask: Task = {
      ...task,
      title,
      category,
      priority,
      recurrence,
      reminder,
    };
    onTaskUpdate(updatedTask);
  };

  const getCategoryColor = (cat: TaskCategory): string => {
    switch (cat) {
      case 'Health': return '#4CAF50'; // Green
      case 'Work': return '#2196F3';   // Blue
      case 'Personal': return '#FF9800'; // Orange
      case 'Other': return '#9C27B0';  // Purple
      default: return '#757575';      // Grey
    }
  };

  const getPriorityColor = (pri: TaskPriority): string => {
    switch (pri) {
      case 'High': return '#f44336';  // Red
      case 'Medium': return '#FF9800'; // Orange
      case 'Low': return '#4CAF50';    // Green
      default: return '#757575';      // Grey
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.checkbox, task.completed && styles.checkedBox]}
          onPress={() => onToggleComplete(task.id)}
        >
          {task.completed && (
            <MaterialCommunityIcons name="check" size={20} color="white" />
          )}
        </TouchableOpacity>
        
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Task title"
          autoCapitalize="sentences"
          onBlur={handleSave}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category</Text>
        <CategorySelector 
          selectedCategory={category} 
          onSelectCategory={setCategory} 
          showLabel={true}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Priority</Text>
        <PrioritySelector 
          selectedPriority={priority} 
          onSelectPriority={setPriority}
          showLabel={true}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recurrence</Text>
        <RecurrenceSelector 
          recurrence={recurrence}
          onRecurrenceChange={setRecurrence}
          showLabel={true}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reminder</Text>
        <ReminderSelector 
          reminderSettings={reminder}
          onReminderChange={setReminder}
          showLabel={true}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]} 
          onPress={handleSave}
        >
          <MaterialCommunityIcons name="content-save" size={20} color="white" />
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.deleteButton]} 
          onPress={() => onDelete(task.id)}
        >
          <MaterialCommunityIcons name="delete" size={20} color="white" />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#757575',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkedBox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#424242',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
});