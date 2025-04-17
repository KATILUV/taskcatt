import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
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
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);
  
  // Load tasks from storage
  const loadTasks = async () => {
    setLoading(true);
    const loadedTasks = await StorageService.loadTasks();
    setTasks(loadedTasks);
    setLoading(false);
  };
  
  const getCategoryColor = useCallback((category: TaskCategory): string => {
    switch (category) {
      case 'Health': return '#4CAF50'; // Green
      case 'Work': return '#2196F3';   // Blue
      case 'Personal': return '#FF9800'; // Orange
      case 'Other': return '#9C27B0';  // Purple
      default: return '#757575';      // Grey
    }
  }, []);

  // Task management functions
  const handleAddTask = useCallback(() => {
    // Simple demo task - in a real app, you'd have a form
    const categories = TASK_CATEGORIES;
    const priorities = TASK_PRIORITIES;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: `Task ${tasks.length + 1}`,
      completed: false,
      createdAt: Date.now(),
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
    };
    
    StorageService.addTask(newTask)
      .then(() => {
        setTasks(prevTasks => [...prevTasks, newTask]);
      });
  }, [tasks.length]);
  
  const handleDeleteTask = useCallback((id: string) => {
    StorageService.deleteTask(id)
      .then(() => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      });
  }, []);
  
  const handleToggleComplete = useCallback((id: string) => {
    const taskToUpdate = tasks.find(task => task.id === id);
    
    if (!taskToUpdate) return;
    
    const updatedTask: Task = {
      ...taskToUpdate,
      completed: !taskToUpdate.completed
    };
    
    StorageService.updateTask(updatedTask)
      .then(() => {
        setTasks(prevTasks => 
          prevTasks.map(task => task.id === id ? updatedTask : task)
        );
        
        // Show confetti when task is completed
        if (!taskToUpdate.completed) {
          setShowConfetti(true);
        }
      });
  }, [tasks]);

  return (
    <View style={styles.container}>
      {showConfetti && (
        <Confetti 
          count={50} 
          duration={3000}
          onAnimationComplete={() => setShowConfetti(false)}
        />
      )}
      
      {tasks.length === 0 ? (
        <EmptyState 
          title="No Tasks Yet" 
          message="Add your first task by using the + button below" 
          type="tasks"
        />
      ) : (
        <FlatList
          data={tasks}
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
      
      <TouchableOpacity style={styles.fab} onPress={handleAddTask}>
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