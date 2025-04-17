import React, { useEffect, useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  Image,
  ScrollView,
  RefreshControl
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { StorageService } from '../services/StorageService';
import { TASK_CATEGORIES, TaskCategory } from '../models/Task';
import ProgressBar from '../components/ProgressBar';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#0066cc',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressSection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  progressMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  categorySection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
  },
  categoryList: {
    marginTop: 8,
  },
  categoryItem: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 8,
  },
  categoryBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 18,
  },
  categoryBar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryBarFill: {
    width: '40%',
    height: '100%',
    borderRadius: 4,
  },
  noCategoriesText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
  },
  cardContainer: {
    padding: 16,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  cardActions: {
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAction: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  cardActionArrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});