import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  TextStyle
} from 'react-native';
import { TaskCategory, TASK_CATEGORIES } from '../models/Task';
import { createStyles, useTheme } from '../utils/Theme';
import { scaleFont, scale, isTablet } from '../utils/ResponsiveUtils';

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
  const { theme } = useTheme();
  const styles = useStyles();

  const getCategoryColor = (category: TaskCategory): string => {
    switch (category) {
      case 'Health':
        return theme.colors.categoryHealth; // Green
      case 'Work':
        return theme.colors.categoryWork; // Blue
      case 'Personal':
        return theme.colors.categoryPersonal; // Purple
      case 'Other':
      default:
        return theme.colors.categoryOther; // Gray
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

const useStyles = createStyles((theme) => {
  const isTab = isTablet();
  
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: scale(4),
    },
    label: {
      fontSize: scaleFont(16),
      fontWeight: '500',
      color: theme.colors.textPrimary,
      marginRight: scale(8),
    } as TextStyle,
    selector: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryBadge: {
      paddingHorizontal: scale(12),
      paddingVertical: scale(6),
      borderRadius: scale(16),
      marginRight: scale(8),
    },
    categoryText: {
      fontSize: scaleFont(14),
      fontWeight: '500',
      color: theme.colors.white,
    } as TextStyle,
    selectedCategoryText: {
      fontWeight: 'bold',
    } as TextStyle,
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.backgroundCard,
      borderTopLeftRadius: scale(20),
      borderTopRightRadius: scale(20),
      padding: scale(20),
      elevation: 5,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    modalTitle: {
      fontSize: scaleFont(20),
      fontWeight: 'bold',
      marginBottom: scale(16),
      textAlign: 'center',
      color: theme.colors.textPrimary,
    } as TextStyle,
    categoriesList: {
      paddingBottom: scale(20),
    },
    categoryItem: {
      paddingVertical: scale(12),
    },
    closeButton: {
      backgroundColor: theme.colors.lightGray,
      padding: scale(16),
      borderRadius: scale(12),
      alignItems: 'center',
      marginTop: scale(10),
    },
    closeButtonText: {
      fontSize: scaleFont(16),
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    } as TextStyle,
  });
});

export default CategorySelector;