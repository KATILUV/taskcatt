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
  FlatList,
  Animated,
  Dimensions,
  StatusBar
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
import BottomSheet from '../components/BottomSheet';
import TaskDetail from '../components/TaskDetail';
import FloatingActionButton from '../components/FloatingActionButton';
import { isTablet, scale, scaleFont } from '../utils/ResponsiveUtils';
import { createStyles, useTheme } from '../utils/Theme';
import { IconButton } from '../components/IconButton';
import { ThemeToggle } from '../components/ThemeToggle';

type Props = NativeStackScreenProps<RootStackParamList, 'Routine'>;

export default function RoutineScreen({ navigation }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<TaskCategory | 'All'>('All');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<TaskPriority | 'All'>('All');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isTaskInputVisible, setIsTaskInputVisible] = useState(false);
  
  // Get theme from context
  const { theme } = useTheme();
  
  // Animation values for screen transitions and staggered item animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animatedItemValues = useRef<{[key: string]: Animated.Value}>({}).current;

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
  
  // Screen transition animation
  useEffect(() => {
    // When tasks load and loading is complete, fade in the screen
    if (!loading) {
      // Animate the overall screen fade-in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Set up staggered animations for each task item
      const animations: Animated.CompositeAnimation[] = [];
      
      // Create an animated value for each task if it doesn't exist
      tasks.forEach((task, index) => {
        if (!animatedItemValues[task.id]) {
          animatedItemValues[task.id] = new Animated.Value(0);
        }
        
        // Add staggered animation for each task
        animations.push(
          Animated.timing(animatedItemValues[task.id], {
            toValue: 1,
            duration: 200,
            delay: 100 + (index * 50), // Stagger the animations
            useNativeDriver: true,
          })
        );
      });
      
      // Run all animations in parallel
      if (animations.length > 0) {
        Animated.parallel(animations).start();
      }
    }
  }, [loading, tasks, fadeAnim, animatedItemValues]);

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
    
    // Get or create the animated value for this task
    if (!animatedItemValues[item.id]) {
      animatedItemValues[item.id] = new Animated.Value(0);
    }
    
    // Animation style for the staggered fade-in and translate
    const animatedStyle = {
      opacity: animatedItemValues[item.id],
      transform: [
        {
          translateY: animatedItemValues[item.id].interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0], // Start 20 pixels down and move up to final position
          }),
        },
      ],
    };
    
    // Handle task selection to show details in the bottom sheet
    const handleTaskSelect = () => {
      setSelectedTask(item);
      setIsDetailVisible(true);
    };
    
    return (
      <Animated.View style={animatedStyle}>
        <ScaleDecorator>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleTaskSelect}
            onLongPress={drag}
            delayLongPress={200}
            disabled={isActive}
          >
            <TaskItem
              task={item}
              drag={drag}
              isActive={isActive}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
            />
          </TouchableOpacity>
        </ScaleDecorator>
      </Animated.View>
    );
  }, [handleDeleteTask, handleToggleComplete, animatedItemValues]);

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
    <Animated.View style={{...styles.container, opacity: fadeAnim}}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Tasks</Text>
          <View style={styles.headerActions}>
            <ThemeToggle size="small" style={{ marginRight: 8 }} />
            <IconButton 
              name="home" 
              variant="primary" 
              onPress={() => {
                // Fade out animation when navigating away
                Animated.timing(fadeAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start(() => {
                  navigation.navigate('Home');
                });
              }}
            />
          </View>
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
        
        {/* Replace TaskInput with a FAB */}
        <FloatingActionButton
          mainIcon="add"
          position="bottomRight"
          color={theme.colors.primary}
          size="large"
          actions={[
            {
              icon: "create-outline",
              label: "New Task",
              onPress: () => setIsTaskInputVisible(true),
              color: theme.colors.success,
            },
            {
              icon: "filter-outline",
              label: "Reset Filters",
              onPress: () => {
                setSelectedCategoryFilter('All');
                setSelectedPriorityFilter('All');
              },
              color: theme.colors.info,
            },
          ]}
        />
        
        {/* Bottom Sheets */}
        <BottomSheet
          visible={isDetailVisible}
          onClose={() => setIsDetailVisible(false)}
          title="Task Details"
          height={Dimensions.get('window').height * 0.8}
        >
          {selectedTask && (
            <TaskDetail
              task={selectedTask}
              onTaskUpdate={async (updatedTask) => {
                try {
                  const updatedTasks = tasks.map(task => 
                    task.id === updatedTask.id ? updatedTask : task
                  );
                  await StorageService.saveTasks(updatedTasks);
                  setTasks(updatedTasks);
                  setIsDetailVisible(false);
                } catch (error) {
                  console.error('Error updating task:', error);
                }
              }}
              onDelete={async (id) => {
                try {
                  await handleDeleteTask(id);
                  setIsDetailVisible(false);
                } catch (error) {
                  console.error('Error deleting task:', error);
                }
              }}
              onToggleComplete={async (id) => {
                try {
                  handleToggleComplete(id);
                  
                  // Update selected task state to reflect change in completion status
                  if (selectedTask && selectedTask.id === id) {
                    setSelectedTask({
                      ...selectedTask,
                      completed: !selectedTask.completed
                    });
                  }
                } catch (error) {
                  console.error('Error toggling task completion:', error);
                }
              }}
            />
          )}
        </BottomSheet>
        
        <BottomSheet
          visible={isTaskInputVisible}
          onClose={() => setIsTaskInputVisible(false)}
          title="Add New Task"
        >
          <TaskInput
            onAddTask={(title, category, priority, recurrence, reminder) => {
              handleAddTask(title, category, priority, recurrence, reminder);
              setIsTaskInputVisible(false);
            }}
          />
        </BottomSheet>
      </SafeAreaView>
    </Animated.View>
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
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backgroundSecondary,
      backgroundColor: theme.colors.backgroundCard,
      height: theme.layout.headerHeight + (isTab ? 8 : 4),
      ...theme.shadows.small,
    },
    title: {
      ...theme.typography.h2,
      fontFamily: theme.fonts.bold,
      fontWeight: '700',
      color: theme.colors.primary,
      letterSpacing: -0.25,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    filterContainer: {
      backgroundColor: theme.colors.backgroundCard,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backgroundSecondary,
    },
    filterScroll: {
      paddingHorizontal: theme.spacing.lg,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginHorizontal: theme.spacing.xs,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.backgroundSecondary,
      backgroundColor: theme.colors.backgroundCard,
      height: scale(isTab ? 40 : 36),
    },
    filterButtonActive: {
      backgroundColor: theme.colors.backgroundSecondary + '80',
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    filterButtonText: {
      fontSize: scaleFont(isTab ? 14 : 13),
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.medium,
      fontWeight: '500',
      letterSpacing: 0.25,
    },
    filterButtonTextActive: {
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.primary,
      letterSpacing: 0.25,
    },
    filtersSection: {
      backgroundColor: theme.colors.backgroundCard,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backgroundSecondary,
      paddingBottom: theme.spacing.sm,
    },
    filterSectionTitle: {
      ...theme.typography.subtitle2,
      fontFamily: theme.fonts.semiBold,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginLeft: theme.spacing.lg,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.15,
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
      paddingBottom: scale(80),
      paddingHorizontal: theme.spacing.lg,
    },
    emptyText: {
      ...theme.typography.h3,
      fontFamily: theme.fonts.semiBold,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
      letterSpacing: 0,
    },
    emptySubtext: {
      ...theme.typography.body1,
      fontFamily: theme.fonts.regular,
      fontWeight: '400',
      color: theme.colors.textDisabled,
      textAlign: 'center',
      letterSpacing: 0.25,
      lineHeight: scaleFont(24),
    },
    listContent: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: isTab ? theme.spacing.lg : theme.spacing.md,
    },
  });
});