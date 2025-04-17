import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Task, TaskCategory, TaskPriority } from '../models/Task';

interface TaskItemProps {
  task: Task;
  drag: () => void;
  isActive: boolean;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  drag, 
  isActive, 
  onDelete,
  onToggleComplete
}) => {
  const getCategoryColor = (category: TaskCategory): string => {
    switch (category) {
      case 'Health':
        return '#4CAF5080'; // Green with opacity
      case 'Work':
        return '#2196F380'; // Blue with opacity
      case 'Personal':
        return '#9C27B080'; // Purple with opacity
      case 'Other':
      default:
        return '#75757580'; // Gray with opacity
    }
  };
  
  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'High':
        return '#E5393580'; // Red with opacity
      case 'Medium':
        return '#FB8C0080'; // Orange with opacity
      case 'Low':
        return '#43A04780'; // Green with opacity
      default:
        return '#75757580'; // Gray with opacity
    }
  };
  return (
    <TouchableOpacity
      onLongPress={drag}
      style={[
        styles.taskContainer,
        isActive && styles.activeTask,
        task.completed && styles.completedTask
      ]}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={[styles.checkbox, task.completed && styles.checkedBox]}
        onPress={() => onToggleComplete(task.id)}
      >
        {task.completed && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.textContainer}>
        <Text 
          style={[
            styles.taskTitle, 
            task.completed && styles.completedText
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        <View style={styles.detailsContainer}>
          {task.category && (
            <View style={[
              styles.categoryBadge, 
              { backgroundColor: getCategoryColor(task.category) }
            ]}>
              <Text style={styles.categoryText}>{task.category}</Text>
            </View>
          )}
          {task.priority && (
            <View style={[
              styles.priorityBadge, 
              { backgroundColor: getPriorityColor(task.priority) }
            ]}>
              <Text style={styles.priorityText}>{task.priority}</Text>
            </View>
          )}
          {task.completed && (
            <Text style={styles.completedLabel}>Completed</Text>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  activeTask: {
    backgroundColor: '#f0f9ff',
    shadowOpacity: 0.4,
    elevation: 4,
    transform: [{ scale: 1.03 }],
  },
  completedTask: {
    backgroundColor: '#f8f8f8',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  taskTitle: {
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
  },
  completedLabel: {
    fontSize: 12,
    color: '#4CAF50',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0066cc',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffeeee',
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#ff6666',
    fontWeight: 'bold',
  },
});

export default TaskItem;