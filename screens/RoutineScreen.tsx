import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  FlatList,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  ActivityIndicator,
  Chip,
  Badge,
  Title,
  Divider,
  Appbar,
  useTheme as usePaperTheme
} from 'react-native-paper';
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

  // Load tasks from AsyncStorage with optimized performance
  useEffect(() => {
    // Track component mount state to prevent memory leaks
    let isMounted = true;
    
    const loadTasks = async () => {
      try {
        // Use optimized loading with cache prioritization
        // This will first use the memory cache if available for instant rendering
        const savedTasks = await StorageService.loadTasks(true, undefined, undefined, false);
        
        // Update state only if component is still mounted (prevents memory leaks)
        if (isMounted) {
          setTasks(savedTasks);
          
          // Background refresh to ensure data freshness without blocking UI
          setTimeout(() => {
            if (isMounted) {
              StorageService.loadTasks(true, undefined, undefined, true).then(freshTasks => {
                if (isMounted && JSON.stringify(freshTasks) !== JSON.stringify(savedTasks)) {
                  setTasks(freshTasks);
                }
              }).catch(err => console.error('Background refresh error:', err));
            }
          }, 300); // Small delay to prioritize UI rendering first
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        // Fallback to empty array instead of undefined state
        if (isMounted) {
          setTasks([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTasks();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Screen transition animation with optimized performance
  useEffect(() => {
    // When tasks load and loading is complete, fade in the screen
    if (!loading) {
      // Animate the overall screen fade-in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Performance optimization: Only animate visible items
      // This is much more efficient for large lists
      const MAX_ANIMATIONS = 15; // Only animate the first visible batch
      const visibleTasks = tasks.slice(0, MAX_ANIMATIONS);
      
      // Pre-allocate animations array
      const animations: Animated.CompositeAnimation[] = [];
      animations.length = visibleTasks.length;
      
      // Create and reuse animated values for better performance
      visibleTasks.forEach((task, index) => {
        // Create animated value if it doesn't exist yet
        if (!animatedItemValues[task.id]) {
          animatedItemValues[task.id] = new Animated.Value(0);
        }
        
        // Calculate optimized delay that feels smooth but keeps total animation time reasonable
        // This prevents long delays with large lists
        const optimizedDelay = Math.min(100 + (index * 30), 500);
        
        // Add animation to pre-allocated array
        animations[index] = Animated.timing(animatedItemValues[task.id], {
          toValue: 1,
          duration: 200,
          delay: optimizedDelay,
          useNativeDriver: true,
        });
      });
      
      // Run animations in parallel with a single call
      if (animations.length > 0) {
        // Use sequence for the first few items, then parallel for the rest
        // This gives a nice staggered effect without blocking the UI
        Animated.parallel(animations).start();
        
        // For off-screen items, just set them to visible without animation
        if (tasks.length > MAX_ANIMATIONS) {
          setTimeout(() => {
            tasks.slice(MAX_ANIMATIONS).forEach(task => {
              if (!animatedItemValues[task.id]) {
                animatedItemValues[task.id] = new Animated.Value(1);
              } else {
                animatedItemValues[task.id].setValue(1);
              }
            });
          }, 500); // Small delay to ensure visible animations have time to start
        }
      }
    }
  }, [loading, tasks, fadeAnim, animatedItemValues]);

  // Save tasks to AsyncStorage with debouncing for better performance
  useEffect(() => {
    // Track if the component is mounted
    let isMounted = true;
    
    // Debounce save operations to avoid frequent writes
    // This significantly improves performance when tasks change rapidly
    let saveTimeoutId: NodeJS.Timeout | null = null;
    
    const saveTasks = async () => {
      if (!loading && tasks.length > 0) {
        try {
          await StorageService.saveTasks(tasks);
        } catch (error) {
          console.error('Error saving tasks:', error);
        }
      }
    };

    // Clear any existing timeout to prevent duplicate saves
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }
    
    // Debounce the save operation by 300ms to batch rapid changes
    saveTimeoutId = setTimeout(() => {
      if (isMounted) {
        saveTasks();
      }
    }, 300);
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId);
      }
    };
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
      <Surface style={styles.loadingContainer} elevation={0}>
        <ActivityIndicator size="large" color={theme.colors.primary} animating={true} />
      </Surface>
    );
  }

  // Get priority color for filter buttons - memoized for better performance
  const getPriorityColor = useCallback((priority: TaskPriority): string => {
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
  }, [theme.colors]);

  // Filter tasks based on selected category and priority
  // Memoize filtered tasks with optimized performance for large lists
  const filteredTasks = useMemo(() => {
    // Fast path: Early return if no filters are applied to avoid unnecessary computation
    if (selectedCategoryFilter === 'All' && selectedPriorityFilter === 'All') {
      return tasks;
    }
    
    // Optimization: Check if we only need to filter by one property
    if (selectedCategoryFilter === 'All') {
      // Only filter by priority (faster than checking two conditions)
      return tasks.filter(task => task.priority === selectedPriorityFilter);
    }
    
    if (selectedPriorityFilter === 'All') {
      // Only filter by category (faster than checking two conditions)
      return tasks.filter(task => task.category === selectedCategoryFilter);
    }
    
    // If we need to filter by both, use a single pass with both conditions
    // Pre-allocate result array capacity for better performance
    const result: Task[] = [];
    result.length = Math.floor(tasks.length / 2); // Estimate filtered size
    
    let actualLength = 0;
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (task.category === selectedCategoryFilter && task.priority === selectedPriorityFilter) {
        result[actualLength++] = task;
      }
    }
    
    // Trim result array to actual size
    result.length = actualLength;
    return result;
  }, [tasks, selectedCategoryFilter, selectedPriorityFilter]);

  // Get category color for filter buttons - memoized for better performance
  const getCategoryColor = useCallback((category: TaskCategory): string => {
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
  }, [theme.colors]);

  return (
    <Animated.View style={{...styles.container, opacity: fadeAnim}}>
      <SafeAreaView style={styles.container}>
        <Surface style={styles.header} elevation={4}>
          <Appbar.Header style={styles.appbarHeader}>
            <Title style={styles.title}>My Tasks</Title>
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
          </Appbar.Header>
        </Surface>
        
        <Surface style={styles.filtersSection} elevation={1}>
          <Title style={styles.filterSectionTitle}>Categories</Title>
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <Chip
                mode={selectedCategoryFilter === 'All' ? 'flat' : 'outlined'}
                selected={selectedCategoryFilter === 'All'}
                onPress={() => setSelectedCategoryFilter('All')}
                style={styles.chip}
              >
                All Categories
              </Chip>
              
              {TASK_CATEGORIES.map(category => (
                <Chip
                  key={category}
                  mode={selectedCategoryFilter === category ? 'flat' : 'outlined'}
                  selected={selectedCategoryFilter === category}
                  onPress={() => setSelectedCategoryFilter(category)}
                  style={[styles.chip, { borderColor: getCategoryColor(category) }]}
                  avatar={
                    <Badge 
                      style={{ backgroundColor: getCategoryColor(category) }}
                      size={8}
                    />
                  }
                >
                  {category}
                </Chip>
              ))}
            </ScrollView>
          </View>

          <Title style={styles.filterSectionTitle}>Priority</Title>
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <Chip
                mode={selectedPriorityFilter === 'All' ? 'flat' : 'outlined'}
                selected={selectedPriorityFilter === 'All'}
                onPress={() => setSelectedPriorityFilter('All')}
                style={styles.chip}
              >
                All Priorities
              </Chip>
              
              {TASK_PRIORITIES.map(priority => (
                <Chip
                  key={priority}
                  mode={selectedPriorityFilter === priority ? 'flat' : 'outlined'}
                  selected={selectedPriorityFilter === priority}
                  onPress={() => setSelectedPriorityFilter(priority)}
                  style={[styles.chip, { borderColor: getPriorityColor(priority) }]}
                  avatar={
                    <Badge 
                      style={{ backgroundColor: getPriorityColor(priority) }}
                      size={8}
                    />
                  }
                >
                  {priority}
                </Chip>
              ))}
            </ScrollView>
          </View>
        </Surface>
        
        {filteredTasks.length === 0 ? (
          <Surface style={styles.emptyContainer} elevation={0}>
            <Title style={styles.emptyText}>
              {tasks.length === 0 ? 'No tasks yet' : 'No tasks in this category'}
            </Title>
            <Text style={styles.emptySubtext}>
              {tasks.length === 0 ? 'Add a task to get started' : 'Try selecting a different category'}
            </Text>
          </Surface>
        ) : (
          <DraggableFlatList
            ref={flatListRef}
            data={filteredTasks}
            onDragEnd={handleDragEnd}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            getItemLayout={getItemLayout}
            maxToRenderPerBatch={8} // Reduced for smoother scrolling
            windowSize={8} // Optimized window size
            updateCellsBatchingPeriod={30} // Faster batching for smoother performance
            initialNumToRender={10} // Optimal for most device screens
            removeClippedSubviews={true}
            extraData={taskIds}
            maintainVisibleContentPosition={{ // Keep scroll position consistent
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10
            }}
            // Enhanced performance via list configuration
            showsVerticalScrollIndicator={false}
            // Memory optimization
            onEndReachedThreshold={0.5}
            // Optimize scrolling performance
            scrollEventThrottle={16} // Targets 60fps
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
      backgroundColor: theme.colors.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backgroundSecondary,
      height: theme.layout.headerHeight + (isTab ? 8 : 4),
      ...theme.shadows.medium,
    },
    appbarHeader: {
      backgroundColor: 'transparent',
      elevation: 0,
      height: theme.layout.headerHeight,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      ...theme.typography.h2,
      fontFamily: theme.fonts.bold,
      fontWeight: '700',
      color: 'white',
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
    chip: {
      marginHorizontal: theme.spacing.xs,
      height: scale(isTab ? 40 : 36),
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