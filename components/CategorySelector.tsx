import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TaskCategory, TASK_CATEGORIES } from '../models/Task';

interface CategorySelectorProps {
  selectedCategory: TaskCategory;
  onSelectCategory: (category: TaskCategory) => void;
  showLabel?: boolean;
}

export default function CategorySelector({ 
  selectedCategory, 
  onSelectCategory,
  showLabel = false
}: CategorySelectorProps) {
  
  const getCategoryColor = (category: TaskCategory): string => {
    switch (category) {
      case 'Health': return '#4CAF50'; // Green
      case 'Work': return '#2196F3';   // Blue
      case 'Personal': return '#FF9800'; // Orange
      case 'Other': return '#9C27B0';  // Purple
      default: return '#757575';      // Grey
    }
  };
  
  const getCategoryIcon = (category: TaskCategory): string => {
    switch (category) {
      case 'Health': return 'heart-pulse';
      case 'Work': return 'briefcase';
      case 'Personal': return 'account';
      case 'Other': return 'dots-horizontal';
      default: return 'tag';
    }
  };
  
  const renderCategoryBadge = (category: TaskCategory, isSelected: boolean) => {
    return (
      <TouchableOpacity
        key={category}
        style={[
          styles.categoryBadge,
          { backgroundColor: getCategoryColor(category) },
          isSelected && styles.selectedBadge
        ]}
        onPress={() => handleSelectCategory(category)}
      >
        <MaterialCommunityIcons 
          name={getCategoryIcon(category)} 
          size={24} 
          color="white" 
        />
        {showLabel && <Text style={styles.categoryLabel}>{category}</Text>}
      </TouchableOpacity>
    );
  };
  
  const handleSelectCategory = (category: TaskCategory) => {
    onSelectCategory(category);
  };
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {TASK_CATEGORIES.map(category => 
        renderCategoryBadge(category, category === selectedCategory)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    minWidth: 44,
  },
  selectedBadge: {
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  categoryLabel: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  }
});