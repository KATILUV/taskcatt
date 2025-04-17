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
      fontFamily: theme.fonts.medium,
      color: theme.colors.textPrimary,
      marginRight: theme.spacing.md,
      letterSpacing: 0.1,
    } as TextStyle,
    selector: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryBadge: {
      paddingHorizontal: scale(14),
      paddingVertical: scale(7),
      borderRadius: scale(18),
      marginRight: theme.spacing.sm,
      ...theme.shadows.small,
    },
    categoryText: {
      fontSize: scaleFont(14),
      fontWeight: '500',
      fontFamily: theme.fonts.medium,
      color: theme.colors.white,
      letterSpacing: 0.2,
    } as TextStyle,
    selectedCategoryText: {
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
    } as TextStyle,
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
      backgroundColor: theme.colors.backgroundCard,
      borderTopLeftRadius: scale(24),
      borderTopRightRadius: scale(24),
      padding: theme.spacing.xl,
      ...theme.shadows.large,
    },
    modalTitle: {
      fontSize: scaleFont(20),
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
      color: theme.colors.textPrimary,
      letterSpacing: 0.2,
    } as TextStyle,
    categoriesList: {
      paddingBottom: theme.spacing.lg,
    },
    categoryItem: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
    },
    closeButton: {
      backgroundColor: theme.colors.backgroundSecondary,
      padding: theme.spacing.md,
      borderRadius: scale(16),
      alignItems: 'center',
      marginTop: theme.spacing.md,
      ...theme.shadows.small,
    },
    closeButtonText: {
      fontSize: scaleFont(16),
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.textPrimary,
      letterSpacing: 0.2,
    } as TextStyle,
  });
});

export default CategorySelector;