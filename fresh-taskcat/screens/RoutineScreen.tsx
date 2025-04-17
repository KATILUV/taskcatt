import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Task, TaskCategory, TaskPriority, RecurrenceSettings, ReminderSettings, TASK_CATEGORIES, TASK_PRIORITIES } from '../models/Task';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import EmptyState from '../components/EmptyState';
import TaskItem from '../components/TaskItem';
import Confetti from '../components/Confetti';
import { StorageService } from '../services/StorageService';

// Component props type
type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Routine'>;
};

export default function RoutineScreen({ navigation }: Props) {
  const [routines, setRoutines] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Load routines on component mount - simulated for now
  useEffect(() => {
    // In a full implementation, you'd filter tasks that are recurring
    setRoutines([]);
    setLoading(false);
  }, []);
  
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

  // Routine management functions
  const handleAddRoutine = useCallback(() => {
    // Simple demo routine - in a real app, you'd have a form
    const categories = TASK_CATEGORIES;
    const priorities = TASK_PRIORITIES;
    
    const newRoutine: Task = {
      id: Date.now().toString(),
      title: `Routine ${routines.length + 1}`,
      completed: false,
      createdAt: Date.now(),
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      recurrence: {
        pattern: 'Daily',
        interval: 1
      }
    };
    
    StorageService.addTask(newRoutine)
      .then(() => {
        setRoutines(prevRoutines => [...prevRoutines, newRoutine]);
      });
  }, [routines.length]);
  
  const handleDeleteTask = useCallback((id: string) => {
    StorageService.deleteTask(id)
      .then(() => {
        setRoutines(prevRoutines => prevRoutines.filter(routine => routine.id !== id));
      });
  }, []);
  
  const handleToggleComplete = useCallback((id: string) => {
    const routineToUpdate = routines.find(routine => routine.id === id);
    
    if (!routineToUpdate) return;
    
    const updatedRoutine: Task = {
      ...routineToUpdate,
      completed: !routineToUpdate.completed
    };
    
    StorageService.updateTask(updatedRoutine)
      .then(() => {
        setRoutines(prevRoutines => 
          prevRoutines.map(routine => routine.id === id ? updatedRoutine : routine)
        );
        
        // Show confetti when routine is completed
        if (!routineToUpdate.completed) {
          setShowConfetti(true);
        }
      });
  }, [routines]);

  return (
    <View style={styles.container}>
      {showConfetti && (
        <Confetti 
          count={50} 
          duration={3000}
          onAnimationComplete={() => setShowConfetti(false)}
        />
      )}
      
      {routines.length === 0 ? (
        <EmptyState 
          title="No Routines Yet" 
          message="Add your first routine by using the + button below" 
          type="routines"
        />
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      <TouchableOpacity style={styles.fab} onPress={handleAddRoutine}>
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>
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
  listContent: {
    paddingBottom: 80, // Space for FAB
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
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#6200EE',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  }
});