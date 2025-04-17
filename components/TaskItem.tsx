import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Task } from '../models/Task';

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
      />
      
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
    opacity: 0.8,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  taskTitle: {
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0066cc',
    marginRight: 8,
  },
  checkedBox: {
    backgroundColor: '#0066cc',
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