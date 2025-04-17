import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Button, 
  SafeAreaView, 
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  FlatList
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import type { RootStackParamList } from '../App';
import { 
  Task, 
  TaskCategory, 
  TASK_CATEGORIES, 
  TaskPriority, 
  TASK_PRIORITIES,
  RecurrenceSettings,
  ReminderSettings 
} from '../models/Task';
import { StorageService } from '../services/StorageService';
import { RecurrenceService } from '../services/RecurrenceService';
import { ReminderService } from '../services/ReminderService';
import TaskItem from '../components/TaskItem';
import TaskInput from '../components/TaskInput';
import { isTablet, scale, scaleFont } from '../utils/ResponsiveUtils';
import { createStyles, theme } from '../utils/Theme';

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
  const handleAddTask = (
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
      recurrence,
      reminder
    };

    // If it has a reminder, schedule it
    if (reminder && reminder.enabled) {
      ReminderService.scheduleReminder(newTask)
        .then(notificationId => {
          if (notificationId && newTask.reminder) {
            newTask.reminder.notificationId = notificationId;
          }
        })
        .catch(err => console.error('Error scheduling reminder:', err));
    }

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, newTask];
      // Immediately save to AsyncStorage - this will also generate recurring instances
      StorageService.saveTasks(updatedTasks).catch(err => 
        console.error('Error saving after adding task:', err)
      );
      return updatedTasks;
    });
  };

  // Delete a task
  const handleDeleteTask = async (id: string) => {
    // Find the task to delete
    const taskToDelete = tasks.find(task => task.id === id);
    if (!taskToDelete) return;
    
    // Check if it's a recurring task or an instance
    const isRecurringParent = RecurrenceService.isRecurring(taskToDelete) && !taskToDelete.parentTaskId;
    const isRecurringInstance = !!taskToDelete.parentTaskId;
    
    // Special handling for recurring tasks
    if (isRecurringParent || isRecurringInstance) {
      // If it's a parent task, we need to delete all instances too
      await StorageService.deleteTask(id, isRecurringParent);
    }
    
    // Update the local state
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter(task => {
        // Filter out the task with this ID
        if (task.id === id) return false;
        
        // If it's a recurring parent, also filter out all its instances
        if (isRecurringParent && task.parentTaskId === id) return false;
        
        return true;
      });
      
      return updatedTasks;
    });
  };

  // Toggle task completion status
  const handleToggleComplete = (id: string) => {
    setTasks((prevTasks) => {
      // Find the task to update
      const taskToUpdate = prevTasks.find(task => task.id === id);
      if (!taskToUpdate) return prevTasks;
      
      // Create the updated task with toggled completion
      const taskWithToggledCompletion = { 
        ...taskToUpdate, 
        completed: !taskToUpdate.completed 
      };
      
      // Create updated tasks array
      let updatedTasks = prevTasks.map(task => 
        task.id === id ? taskWithToggledCompletion : task
      );
      
      // If this is a recurring task instance, update completion history
      if (taskWithToggledCompletion.completed && taskWithToggledCompletion.parentTaskId) {
        // Update the parent task's completion history
        updatedTasks = RecurrenceService.updateCompletionStatus(taskWithToggledCompletion, updatedTasks);
      }
      
      // If this is being marked as completed and has a recurrence pattern,
      // we might want to create the next instance (this happens in StorageService)
      
      // Immediately save to AsyncStorage, this will handle recurring instances
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

  // Create a ref for the FlatList to use for scrolling
  const flatListRef = useRef<any>(null);
  
  // Extract task IDs for optimized rendering (helps with memoization)
  const taskIds = useMemo(() => tasks.map(task => task.id), [tasks]);
  
  // Item key extractor function
  const keyExtractor = useCallback((item: Task) => item.id, []);
  
  // Function to get item layout for improved performance
  const CARD_HEIGHT = theme.layout.listItemHeight * 1.5; // Increased height for card layout
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_HEIGHT,
      offset: CARD_HEIGHT * index,
      index,
    }),
    [CARD_HEIGHT]
  );
  
  // Render individual task item with memoization for better performance
  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Task>) => {
    // Wrap the async delete function for the TaskItem component
    const handleDelete = (id: string) => {
      handleDeleteTask(id).catch(err => 
        console.error('Error deleting task:', err)
      );
    };
    
    return (
      <ScaleDecorator>
        <TaskItem
          task={item}
          drag={drag}
          isActive={isActive}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
        />
      </ScaleDecorator>
    );
  }, [handleDeleteTask, handleToggleComplete]);

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
        return theme.colors.priorityHigh;
      case 'Medium':
        return theme.colors.priorityMedium;
      case 'Low':
        return theme.colors.priorityLow;
      default:
        return theme.colors.categoryOther;
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
        return theme.colors.categoryHealth;
      case 'Work':
        return theme.colors.categoryWork;
      case 'Personal':
        return theme.colors.categoryPersonal;
      case 'Other':
      default:
        return theme.colors.categoryOther;
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
          ref={flatListRef}
          data={filteredTasks}
          onDragEnd={handleDragEnd}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          getItemLayout={getItemLayout}
          maxToRenderPerBatch={10}
          windowSize={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={15}
          removeClippedSubviews={true}
          extraData={taskIds}
        />
      )}
      
      <TaskInput onAddTask={handleAddTask} />
    </SafeAreaView>
  );
}

// Use createStyles from Theme utils to create responsive styles
const styles = createStyles((theme) => {
  const isTab = isTablet();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPrimary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundPrimary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray,
      backgroundColor: theme.colors.white,
      height: theme.layout.headerHeight,
    },
    title: {
      fontSize: scaleFont(isTab ? 26 : 22),
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    filterContainer: {
      backgroundColor: theme.colors.white,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray,
    },
    filterScroll: {
      paddingHorizontal: theme.spacing.md,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginHorizontal: theme.spacing.xs,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.lightGray,
      backgroundColor: theme.colors.white,
      height: scale(isTab ? 40 : 36),
    },
    filterButtonActive: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderWidth: 1.5,
    },
    filterButtonText: {
      fontSize: scaleFont(isTab ? 16 : 14),
      color: theme.colors.textSecondary,
    },
    filterButtonTextActive: {
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    },
    filtersSection: {
      backgroundColor: theme.colors.white,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray,
    },
    filterSectionTitle: {
      fontSize: scaleFont(isTab ? 18 : 16),
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginLeft: theme.spacing.md,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    categoryDot: {
      width: scale(isTab ? 10 : 8),
      height: scale(isTab ? 10 : 8),
      borderRadius: scale(isTab ? 5 : 4),
      marginRight: theme.spacing.xs,
    },
    priorityDot: {
      width: scale(isTab ? 10 : 8),
      height: scale(isTab ? 10 : 8),
      borderRadius: scale(isTab ? 5 : 4),
      marginRight: theme.spacing.xs,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: scale(50),
    },
    emptyText: {
      fontSize: scaleFont(isTab ? 24 : 20),
      fontWeight: 'bold',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    emptySubtext: {
      fontSize: scaleFont(isTab ? 18 : 16),
      color: theme.colors.textDisabled,
    },
    listContent: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: isTab ? theme.spacing.lg : theme.spacing.sm,
    },
  });
});