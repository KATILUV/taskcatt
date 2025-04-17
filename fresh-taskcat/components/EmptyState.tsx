import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = 'cat' | 'clipboard-text-outline' | 'repeat' | 'alert-circle-outline' | 'alert-circle';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: IconName;
  type?: 'default' | 'tasks' | 'routines' | 'error';
  style?: ViewStyle;
}

export default function EmptyState({ 
  title, 
  message, 
  icon, 
  type = 'default', 
  style 
}: EmptyStateProps) {
  // Determine icon based on type
  let iconName: IconName = icon || 'cat';
  
  if (!icon) {
    switch (type) {
      case 'tasks':
        iconName = 'clipboard-text-outline';
        break;
      case 'routines':
        iconName = 'repeat';
        break;
      case 'error':
        iconName = 'alert-circle-outline';
        break;
      default:
        iconName = 'cat';
    }
  }
  
  return (
    <View style={[styles.container, style]}>
      <MaterialCommunityIcons 
        name={iconName} 
        size={80} 
        color="#BDBDBD" 
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#424242',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#757575',
    paddingHorizontal: 24,
  }
});