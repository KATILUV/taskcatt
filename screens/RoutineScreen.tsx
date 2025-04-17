import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Button, SafeAreaView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import type { RootStackParamList } from '../App';
import { Task } from '../models/Task';
import { StorageService } from '../services/StorageService';
import TaskItem from '../components/TaskItem';
import TaskInput from '../components/TaskInput';

type Props = NativeStackScreenProps<RootStackParamList, 'Routine'>;

export default function RoutineScreen({ navigation }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from AsyncStorage on component mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await StorageService.loadTasks();
        setTasks(savedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever they change
  useEffect(() => {
    const saveTasks = async () => {
      if (!loading) {
        await StorageService.saveTasks(tasks);
      }
    };

    saveTasks();
  }, [tasks, loading]);

  // Add a new task
  const handleAddTask = (title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: Date.now(),
    };

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, newTask];
      // Immediately save to AsyncStorage
      StorageService.saveTasks(updatedTasks).catch(err => 
        console.error('Error saving after adding task:', err)
      );
      return updatedTasks;
    });
  };

  // Delete a task
  const handleDeleteTask = (id: string) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter(task => task.id !== id);
      // Immediately save to AsyncStorage
      StorageService.saveTasks(updatedTasks).catch(err => 
        console.error('Error saving after deleting task:', err)
      );
      return updatedTasks;
    });
  };

  // Toggle task completion status
  const handleToggleComplete = (id: string) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      // Immediately save to AsyncStorage
      StorageService.saveTasks(updatedTasks).catch(err => 
        console.error('Error saving after toggling completion:', err)
      );
      return updatedTasks;
    });
  };

  // Update tasks order after drag ends
  const handleDragEnd = useCallback(({ data }: { data: Task[] }) => {
    setTasks(data);
    // Immediately save the updated order to AsyncStorage
    StorageService.saveTasks(data).catch(err => 
      console.error('Error saving after reordering tasks:', err)
    );
  }, []);

  // Render individual task item
  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Task>) => {
    return (
      <ScaleDecorator>
        <TaskItem
          task={item}
          drag={drag}
          isActive={isActive}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
        />
      </ScaleDecorator>
    );
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <Button
          title="Home"
          onPress={() => navigation.navigate('Home')}
        />
      </View>
      
      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tasks yet</Text>
          <Text style={styles.emptySubtext}>Add a task to get started</Text>
        </View>
      ) : (
        <DraggableFlatList
          data={tasks}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      <TaskInput onAddTask={handleAddTask} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
  },
  listContent: {
    paddingVertical: 8,
  },
});