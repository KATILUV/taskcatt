import React, { useEffect, useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  Image,
  ScrollView,
  RefreshControl,
  Dimensions
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { StorageService } from '../services/StorageService';
import { TASK_CATEGORIES, TaskCategory } from '../models/Task';
import ProgressBar from '../components/ProgressBar';
import { isTablet, scale, scaleFont, getResponsiveStyles } from '../utils/ResponsiveUtils';
import { createStyles, theme, colors } from '../utils/Theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [taskCount, setTaskCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);

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
    
    // Load task statistics whenever the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadTaskStats();
    });

    return unsubscribe;
  }, [navigation, loadTaskStats]);

  // Get the status message based on progress
  const getStatusMessage = () => {
    if (taskCount === 0) return "Add some tasks to get started!";
    if (progressPercentage === 100) return "All tasks completed! Great job! 🎉";
    if (progressPercentage >= 75) return "Almost there! Keep going!";
    if (progressPercentage >= 50) return "Halfway there! You're making progress!";
    if (progressPercentage >= 25) return "Good start! Keep it up!";
    return "Just getting started. You can do it!";
  };
  
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Cat</Text>
        <Text style={styles.headerSubtitle}>Stay purr-fectly organized!</Text>
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
            style={styles.taskCard}
            onPress={() => navigation.navigate('Routine')}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>My Tasks</Text>
              <Text style={styles.cardDescription}>
                Organize and track your daily tasks. Drag to reorder, mark as complete, and stay on top of your schedule.
              </Text>
              
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('Routine')}
                >
                  <Text style={styles.actionButtonText}>View Tasks</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Task Cat - Stay Organized</Text>
      </View>
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
    scrollView: {
      flex: 1,
    },
    header: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      height: theme.layout.headerHeight,
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: scaleFont(isTab ? 32 : 28),
      fontWeight: 'bold',
      color: theme.colors.white,
      marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
      fontSize: scaleFont(isTab ? 18 : 16),
      color: 'rgba(255, 255, 255, 0.8)',
    },
    progressSection: {
      ...theme.cardStyle,
      marginTop: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    progressTitle: {
      fontSize: scaleFont(isTab ? 20 : 18),
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    },
    progressPercentage: {
      fontSize: scaleFont(isTab ? 18 : 16),
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    progressMessage: {
      fontSize: scaleFont(isTab ? 16 : 14),
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    statsContainer: {
      ...theme.cardStyle,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      marginTop: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
      padding: theme.spacing.sm,
    },
    statNumber: {
      fontSize: scaleFont(isTab ? 28 : 24),
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    statLabel: {
      fontSize: scaleFont(isTab ? 16 : 14),
      color: theme.colors.textSecondary,
    },
    categorySection: {
      ...theme.cardStyle,
      marginTop: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      padding: theme.spacing.md,
    },
    sectionHeader: {
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: scaleFont(isTab ? 20 : 18),
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    },
    categoryList: {
      marginTop: theme.spacing.sm,
    },
    categoryItem: {
      marginBottom: theme.spacing.sm,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    categoryDot: {
      width: scale(isTab ? 12 : 10),
      height: scale(isTab ? 12 : 10),
      borderRadius: scale(isTab ? 6 : 5),
      marginRight: theme.spacing.sm,
    },
    categoryName: {
      fontSize: scaleFont(isTab ? 16 : 14),
      fontWeight: '500',
      color: theme.colors.textPrimary,
      flex: 1,
    },
    categoryCount: {
      fontSize: scaleFont(isTab ? 16 : 14),
      fontWeight: 'bold',
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
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
      fontSize: scaleFont(isTab ? 16 : 14),
      color: theme.colors.textDisabled,
      fontStyle: 'italic',
      textAlign: 'center',
      marginVertical: theme.spacing.md,
    },
    cardContainer: {
      padding: theme.spacing.md,
    },
    taskCard: {
      ...theme.cardStyle,
      overflow: 'hidden',
    },
    cardContent: {
      padding: theme.spacing.lg,
    },
    cardTitle: {
      fontSize: scaleFont(isTab ? 24 : 20),
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    cardDescription: {
      fontSize: scaleFont(isTab ? 18 : 16),
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      lineHeight: scaleFont(isTab ? 26 : 22),
    },
    cardActions: {
      marginTop: theme.spacing.sm,
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.components.buttonRadius,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      height: theme.components.buttonHeight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonText: {
      color: theme.colors.white,
      fontWeight: 'bold',
      fontSize: scaleFont(isTab ? 18 : 16),
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
    },
    footerText: {
      fontSize: scaleFont(isTab ? 16 : 14),
      color: theme.colors.textDisabled,
    },
  });
});