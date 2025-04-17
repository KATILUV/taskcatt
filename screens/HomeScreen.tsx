import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { StorageService } from '../services/StorageService';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [taskCount, setTaskCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    // Load task statistics whenever the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadTaskStats();
    });

    return unsubscribe;
  }, [navigation]);

  const loadTaskStats = async () => {
    const tasks = await StorageService.loadTasks();
    setTaskCount(tasks.length);
    setCompletedCount(tasks.filter(task => task.completed).length);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Cat</Text>
        <Text style={styles.headerSubtitle}>Stay purr-fectly organized!</Text>
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
          <Text style={styles.statNumber}>{taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0}%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
      </View>

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
            
            <View style={styles.cardFooter}>
              <Text style={styles.cardAction}>View Tasks</Text>
              <Text style={styles.cardActionArrow}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
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
  cardContainer: {
    flex: 1,
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