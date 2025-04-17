import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  Image,
  ScrollView,
  RefreshControl,
  Dimensions,
  Animated,
  StatusBar
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { StorageService } from '../services/StorageService';
import { 
  TASK_CATEGORIES, 
  TaskCategory, 
  Task, 
  TaskPriority, 
  RecurrenceSettings, 
  ReminderSettings 
} from '../models/Task';
import ProgressBar from '../components/ProgressBar';
import { isTablet, scale, scaleFont, getResponsiveStyles } from '../utils/ResponsiveUtils';
import { createStyles, useTheme } from '../utils/Theme';
import { IconButton } from '../components/IconButton';
import { ThemeToggle } from '../components/ThemeToggle';
import BottomSheet from '../components/BottomSheet';
import TaskDetail from '../components/TaskDetail';
import FloatingActionButton from '../components/FloatingActionButton';
import TaskInput from '../components/TaskInput';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [taskCount, setTaskCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isTaskInputVisible, setIsTaskInputVisible] = useState(false);
  
  // Animation values
  const taskCardScale = useRef(new Animated.Value(1)).current;
  const taskCardOpacity = useRef(new Animated.Value(1)).current;
  const screenOpacity = useRef(new Animated.Value(0)).current;

  // Calculate progress percentage
  const calculateProgress = useCallback((total: number, completed: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }, []);

  // Load task statistics
  const loadTaskStats = useCallback(async () => {
    try {
      const tasks = await StorageService.loadTasks();
      const completed = tasks.filter(task => task.completed).length;
      
      // Calculate category statistics
      const catStats: Record<string, number> = {};
      tasks.forEach(task => {
        if (task.category) {
          catStats[task.category] = (catStats[task.category] || 0) + 1;
        }
      });
      
      setTaskCount(tasks.length);
      setCompletedCount(completed);
      setProgressPercentage(calculateProgress(tasks.length, completed));
      setCategoryStats(catStats);
    } catch (error) {
      console.error('Error loading task stats:', error);
    }
  }, [calculateProgress]);

  // Pull-to-refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTaskStats();
    setRefreshing(false);
  }, [loadTaskStats]);

  useEffect(() => {
    // Initial load
    loadTaskStats();
    
    // Fade in the screen when mounted
    Animated.timing(screenOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    
    // Load task statistics whenever the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadTaskStats();
      
      // Fade in the screen when it comes back into focus
      screenOpacity.setValue(0);
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });

    return unsubscribe;
  }, [navigation, loadTaskStats, screenOpacity]);

  // Get the status message based on progress
  const getStatusMessage = () => {
    if (taskCount === 0) return "Add some tasks to get started!";
    if (progressPercentage === 100) return "All tasks completed! Great job! 🎉";
    if (progressPercentage >= 75) return "Almost there! Keep going!";
    if (progressPercentage >= 50) return "Halfway there! You're making progress!";
    if (progressPercentage >= 25) return "Good start! Keep it up!";
    return "Just getting started. You can do it!";
  };
  
  // Get theme from context
  const { theme } = useTheme();
  
  // Get color for a category
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
  
  // Animation handlers for card press
  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(taskCardScale, {
        toValue: 0.96,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(taskCardOpacity, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(taskCardScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(taskCardOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  // Navigation with animation
  const navigateToRoutine = () => {
    // Trigger press out animation to reset card
    handlePressOut();
    
    // Create fade-out animation before navigation
    Animated.timing(taskCardOpacity, {
      toValue: 0.5,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Navigate to routine screen once the animation is complete
      navigation.navigate('Routine');
      
      // Reset opacity back to 1 after navigation
      setTimeout(() => {
        taskCardOpacity.setValue(1);
      }, 300);
    });
  };

  return (
    <Animated.View style={{ flex: 1, opacity: screenOpacity }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Task Cat</Text>
              <Text style={styles.headerSubtitle}>Stay purr-fectly organized!</Text>
            </View>
            <ThemeToggle size="medium" />
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0066cc']}
            />
          }
        >
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
            </View>
            
            <ProgressBar 
              progress={progressPercentage} 
              height={16}
              showPercentage={false}
            />
            
            <Text style={styles.progressMessage}>
              {getStatusMessage()}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{taskCount}</Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{taskCount - completedCount}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>

          {/* Category Breakdown Section */}
          {taskCount > 0 && (
            <View style={styles.categorySection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Category Breakdown</Text>
              </View>
              
              {Object.keys(categoryStats).length > 0 ? (
                <View style={styles.categoryList}>
                  {TASK_CATEGORIES.map(category => (
                    categoryStats[category] ? (
                      <View key={category} style={styles.categoryItem}>
                        <View style={styles.categoryHeader}>
                          <View 
                            style={[
                              styles.categoryDot, 
                              {backgroundColor: getCategoryColor(category)}
                            ]} 
                          />
                          <Text style={styles.categoryName}>{category}</Text>
                          <Text style={styles.categoryCount}>{categoryStats[category]}</Text>
                        </View>
                        <View style={styles.categoryBarContainer}>
                          <View 
                            style={[
                              styles.categoryBar,
                              {
                                backgroundColor: getCategoryColor(category) + '40',
                                width: `${(categoryStats[category] / taskCount) * 100}%`
                              }
                            ]}
                          >
                            <View 
                              style={[
                                styles.categoryBarFill,
                                {backgroundColor: getCategoryColor(category)}
                              ]}
                            />
                          </View>
                        </View>
                      </View>
                    ) : null
                  ))}
                </View>
              ) : (
                <Text style={styles.noCategoriesText}>
                  No categorized tasks yet
                </Text>
              )}
            </View>
          )}
          
          <View style={styles.cardContainer}>
            <TouchableOpacity 
              activeOpacity={0.99} // Use high activeOpacity so we can control the animation
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={navigateToRoutine}
            >
              <Animated.View 
                style={[
                  styles.taskCard,
                  {
                    opacity: taskCardOpacity,
                    transform: [{ scale: taskCardScale }]
                  }
                ]}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>My Tasks</Text>
                  <Text style={styles.cardDescription}>
                    Organize and track your daily tasks. Drag to reorder, mark as complete, and stay on top of your schedule.
                  </Text>
                  
                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={navigateToRoutine}
                    >
                      <Text style={styles.actionButtonText}>View Tasks</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Task Cat - Stay Organized</Text>
        </View>
        
        {/* Floating Action Button */}
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
              icon: "list-outline",
              label: "View All Tasks",
              onPress: navigateToRoutine,
              color: theme.colors.primary,
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
                await StorageService.updateTask(updatedTask);
                loadTaskStats();
                setIsDetailVisible(false);
              }}
              onDelete={async (id) => {
                await StorageService.deleteTask(id);
                loadTaskStats();
                setIsDetailVisible(false);
              }}
              onToggleComplete={async (id) => {
                const tasks = await StorageService.loadTasks();
                const taskIndex = tasks.findIndex(t => t.id === id);
                if (taskIndex >= 0) {
                  const updatedTask = {
                    ...tasks[taskIndex],
                    completed: !tasks[taskIndex].completed
                  };
                  await StorageService.updateTask(updatedTask);
                  
                  // Update selected task too if needed
                  if (selectedTask && selectedTask.id === id) {
                    setSelectedTask(updatedTask);
                  }
                  
                  loadTaskStats();
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
            onAddTask={async (
              title: string, 
              category: TaskCategory, 
              priority: TaskPriority, 
              recurrence?: RecurrenceSettings, 
              reminder?: ReminderSettings
            ) => {
              // Create a new task
              const newTask: Task = {
                id: `task-${Date.now()}`,
                title,
                category,
                priority,
                completed: false,
                createdAt: Date.now(),
                recurrence,
                reminder
              };
              
              await StorageService.addTask(newTask);
              loadTaskStats();
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
    scrollView: {
      flex: 1,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      height: theme.layout.headerHeight + (isTab ? 8 : 4),
      ...theme.shadows.medium,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      ...theme.typography.h1,
      fontFamily: theme.fonts.bold,
      fontWeight: '800',
      color: theme.colors.white,
      marginBottom: theme.spacing.xs,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      ...theme.typography.subtitle2,
      fontFamily: theme.fonts.medium,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.9)',
      letterSpacing: 0.2,
    },
    progressSection: {
      backgroundColor: theme.colors.backgroundCard,
      marginTop: theme.spacing.lg,
      marginHorizontal: theme.spacing.md,
      borderRadius: theme.layout.cardRadius * 1.5,
      padding: theme.spacing.lg,
      ...theme.shadows.medium,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs,
    },
    progressTitle: {
      ...theme.typography.subtitle1,
      color: theme.colors.textPrimary,
      fontFamily: theme.fonts.semiBold,
      fontWeight: '600',
      letterSpacing: 0.15,
    },
    progressPercentage: {
      ...theme.typography.subtitle2,
      color: theme.colors.primary,
      fontFamily: theme.fonts.bold,
      fontWeight: '700',
      letterSpacing: 0.1,
    },
    progressMessage: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.md,
      textAlign: 'center',
      fontStyle: 'italic',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      fontWeight: '400',
      letterSpacing: 0.25,
    },
    statsContainer: {
      backgroundColor: theme.colors.backgroundCard,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      marginHorizontal: theme.spacing.md,
      borderRadius: theme.layout.cardRadius * 1.5,
      ...theme.shadows.medium,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      borderRadius: theme.layout.cardRadius,
      margin: theme.spacing.xs,
    },
    statNumber: {
      ...theme.typography.h3,
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
      fontFamily: theme.fonts.bold,
      fontWeight: '700',
      letterSpacing: -0.25,
    },
    statLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.medium,
      fontWeight: '500',
      letterSpacing: 0.4,
    },
    categorySection: {
      backgroundColor: theme.colors.backgroundCard,
      marginTop: theme.spacing.lg,
      marginHorizontal: theme.spacing.md,
      padding: theme.spacing.lg,
      borderRadius: theme.layout.cardRadius * 1.5,
      ...theme.shadows.medium,
    },
    sectionHeader: {
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs,
    },
    sectionTitle: {
      ...theme.typography.subtitle1,
      color: theme.colors.textPrimary,
      fontFamily: theme.fonts.semiBold,
      fontWeight: '600',
      letterSpacing: 0.15,
    },
    categoryList: {
      marginTop: theme.spacing.md,
    },
    categoryItem: {
      marginBottom: theme.spacing.md,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      borderRadius: theme.layout.cardRadius,
      padding: theme.spacing.md,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    categoryDot: {
      width: scale(isTab ? 12 : 10),
      height: scale(isTab ? 12 : 10),
      borderRadius: scale(isTab ? 6 : 5),
      marginRight: theme.spacing.sm,
    },
    categoryName: {
      ...theme.typography.body2,
      fontFamily: theme.fonts.medium,
      fontWeight: '500',
      color: theme.colors.textPrimary,
      flex: 1,
      letterSpacing: 0.25,
    },
    categoryCount: {
      ...theme.typography.caption,
      fontFamily: theme.fonts.bold,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
      letterSpacing: 0.4,
    },
    categoryBarContainer: {
      height: scale(isTab ? 10 : 8),
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: scale(isTab ? 5 : 4),
      overflow: 'hidden',
      marginLeft: scale(isTab ? 20 : 18),
    },
    categoryBar: {
      height: '100%',
      borderRadius: scale(isTab ? 5 : 4),
    },
    categoryBarFill: {
      width: '40%',
      height: '100%',
      borderRadius: scale(isTab ? 5 : 4),
    },
    noCategoriesText: {
      ...theme.typography.body2,
      color: theme.colors.textDisabled,
      fontStyle: 'italic',
      textAlign: 'center',
      marginVertical: theme.spacing.md,
    },
    cardContainer: {
      padding: theme.spacing.md,
    },
    taskCard: {
      backgroundColor: theme.colors.backgroundCard,
      marginVertical: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      borderRadius: theme.layout.cardRadius * 1.5,
      ...theme.shadows.medium,
      overflow: 'hidden',
    },
    cardContent: {
      padding: theme.spacing.lg,
    },
    cardTitle: {
      ...theme.typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    cardDescription: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      lineHeight: scaleFont(isTab ? 26 : 22),
    },
    cardActions: {
      marginTop: theme.spacing.md,
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.components.buttonRadius,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      height: theme.components.buttonHeight,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.small,
    },
    actionButtonText: {
      fontFamily: theme.fonts.medium,
      fontSize: 14,
      lineHeight: 18,
      letterSpacing: 1.25,
      color: theme.colors.white,
      textTransform: 'uppercase' as 'uppercase',
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardAction: {
      fontSize: scaleFont(isTab ? 18 : 16),
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    cardActionArrow: {
      fontSize: scaleFont(isTab ? 20 : 18),
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginLeft: theme.spacing.sm,
    },
    footer: {
      padding: theme.spacing.md,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.backgroundSecondary,
      marginTop: theme.spacing.sm,
    },
    footerText: {
      ...theme.typography.caption,
      fontFamily: theme.fonts.regular,
      color: theme.colors.textDisabled,
    },
  });
});