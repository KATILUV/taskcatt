import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Button, 
  SafeAreaView, 
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import type { RootStackParamList } from '../App';
import { Task, TaskCategory, TASK_CATEGORIES, TaskPriority, TASK_PRIORITIES } from '../models/Task';
import { StorageService } from '../services/StorageService';
import TaskItem from '../components/TaskItem';
import TaskInput from '../components/TaskInput';

type Props = NativeStackScreenProps<RootStackParamList, 'Routine'>;

export default function RoutineScreen({ navigation }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<TaskCategory | 'All'>('All');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<TaskPriority | 'All'>('All');

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
  const handleAddTask = (title: string, category: TaskCategory, priority: TaskPriority) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: Date.now(),
      category,
      priority
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

  // Get priority color for filter buttons
  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'High':
        return '#E53935'; // Red
      case 'Medium':
        return '#FB8C00'; // Orange
      case 'Low':
        return '#43A047'; // Green
      default:
        return '#757575'; // Gray
    }
  };

  // Filter tasks based on selected category and priority
  const getFilteredTasks = useCallback(() => {
    return tasks.filter(task => {
      const matchesCategory = selectedCategoryFilter === 'All' || task.category === selectedCategoryFilter;
      const matchesPriority = selectedPriorityFilter === 'All' || task.priority === selectedPriorityFilter;
      
      return matchesCategory && matchesPriority;
    });
  }, [tasks, selectedCategoryFilter, selectedPriorityFilter]);

  const filteredTasks = getFilteredTasks();

  // Get category color for filter buttons
  const getCategoryColor = (category: TaskCategory): string => {
    switch (category) {
      case 'Health':
        return '#4CAF50'; // Green
      case 'Work':
        return '#2196F3'; // Blue
      case 'Personal':
        return '#9C27B0'; // Purple
      case 'Other':
      default:
        return '#757575'; // Gray
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <Button
          title="Home"
          onPress={() => navigation.navigate('Home')}
        />
      </View>
      
      <View style={styles.filtersSection}>
        <Text style={styles.filterSectionTitle}>Categories</Text>
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategoryFilter === 'All' && styles.filterButtonActive
              ]}
              onPress={() => setSelectedCategoryFilter('All')}
            >
              <Text style={[
                styles.filterButtonText,
                selectedCategoryFilter === 'All' && styles.filterButtonTextActive
              ]}>All Categories</Text>
            </TouchableOpacity>
            
            {TASK_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  selectedCategoryFilter === category && styles.filterButtonActive,
                  { borderColor: getCategoryColor(category) }
                ]}
                onPress={() => setSelectedCategoryFilter(category)}
              >
                <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(category) }]} />
                <Text style={[
                  styles.filterButtonText,
                  selectedCategoryFilter === category && styles.filterButtonTextActive
                ]}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.filterSectionTitle}>Priority</Text>
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedPriorityFilter === 'All' && styles.filterButtonActive
              ]}
              onPress={() => setSelectedPriorityFilter('All')}
            >
              <Text style={[
                styles.filterButtonText,
                selectedPriorityFilter === 'All' && styles.filterButtonTextActive
              ]}>All Priorities</Text>
            </TouchableOpacity>
            
            {TASK_PRIORITIES.map(priority => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.filterButton,
                  selectedPriorityFilter === priority && styles.filterButtonActive,
                  { borderColor: getPriorityColor(priority) }
                ]}
                onPress={() => setSelectedPriorityFilter(priority)}
              >
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(priority) }]} />
                <Text style={[
                  styles.filterButtonText,
                  selectedPriorityFilter === priority && styles.filterButtonTextActive
                ]}>{priority}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      
      {filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {tasks.length === 0 ? 'No tasks yet' : 'No tasks in this category'}
          </Text>
          <Text style={styles.emptySubtext}>
            {tasks.length === 0 ? 'Add a task to get started' : 'Try selecting a different category'}
          </Text>
        </View>
      ) : (
        <DraggableFlatList
          data={filteredTasks}
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
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  filterScroll: {
    paddingHorizontal: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dddddd',
    backgroundColor: 'white',
  },
  filterButtonActive: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1.5,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    fontWeight: 'bold',
    color: '#333',
  },
  filtersSection: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
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