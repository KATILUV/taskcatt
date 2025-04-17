import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView
} from 'react-native';
import { TaskCategory, TASK_CATEGORIES } from '../models/Task';

interface CategorySelectorProps {
  selectedCategory: TaskCategory;
  onSelectCategory: (category: TaskCategory) => void;
  showLabel?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  showLabel = true,
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);

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

  const renderCategoryBadge = (category: TaskCategory, isSelected: boolean) => {
    const backgroundColor = getCategoryColor(category);
    
    return (
      <View style={[
        styles.categoryBadge,
        { backgroundColor: backgroundColor + (isSelected ? 'FF' : '40') }
      ]}>
        <Text style={[
          styles.categoryText,
          isSelected && styles.selectedCategoryText
        ]}>
          {category}
        </Text>
      </View>
    );
  };

  const openCategoryModal = () => {
    setModalVisible(true);
  };

  const handleSelectCategory = (category: TaskCategory) => {
    onSelectCategory(category);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {showLabel && <Text style={styles.label}>Category:</Text>}
      
      <TouchableOpacity onPress={openCategoryModal} style={styles.selector}>
        {renderCategoryBadge(selectedCategory, true)}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Category</Text>
            
            <FlatList
              data={TASK_CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => handleSelectCategory(item)}
                >
                  {renderCategoryBadge(item, item === selectedCategory)}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.categoriesList}
            />
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginRight: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  selectedCategoryText: {
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  categoriesList: {
    paddingBottom: 20,
  },
  categoryItem: {
    paddingVertical: 12,
  },
  closeButton: {
    backgroundColor: '#e0e0e0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
});

export default CategorySelector;