import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Task, TaskCategory, TaskPriority, RecurrenceSettings, ReminderSettings } from '../models/Task';
import EmptyState from '../components/EmptyState';

// Simplified placeholder component
type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Routine'>;
};

export default function RoutineScreen({ navigation }: Props) {
  const [routines, setRoutines] = useState<Task[]>([]);
  
  const getPriorityColor = useCallback((priority: TaskPriority): string => {
    switch (priority) {
      case 'High': return '#f44336';  // Red
      case 'Medium': return '#FF9800'; // Orange
      case 'Low': return '#4CAF50';    // Green
      default: return '#757575';      // Grey
    }
  }, []);
  
  const getCategoryColor = useCallback((category: TaskCategory): string => {
    switch (category) {
      case 'Health': return '#4CAF50'; // Green
      case 'Work': return '#2196F3';   // Blue
      case 'Personal': return '#FF9800'; // Orange
      case 'Other': return '#9C27B0';  // Purple
      default: return '#757575';      // Grey
    }
  }, []);

  // Placeholder for routine management
  const handleAddRoutine = (
    title: string, 
    category: TaskCategory, 
    priority: TaskPriority,
    recurrence?: RecurrenceSettings,
    reminder?: ReminderSettings
  ) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: Date.now(),
      category,
      priority,
      recurrence: recurrence || {
        pattern: 'Daily',
        interval: 1
      },
      reminder
    };
    
    setRoutines([...routines, newTask]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Routines</Text>
      {routines.length === 0 ? (
        <EmptyState 
          title="No Routines Yet" 
          message="Add your first routine by using the + button" 
          type="routines"
        />
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <Text>{item.title}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  taskItem: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }
});