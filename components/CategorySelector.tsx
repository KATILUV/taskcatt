import React from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList,
  SafeAreaView,
  TextStyle
} from 'react-native';
import {
  Text,
  Chip,
  Portal,
  Modal,
  Button,
  Surface,
  Title,
  TouchableRipple,
  Divider,
  useTheme as usePaperTheme
} from 'react-native-paper';
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

  // Access Paper theme
  const paperTheme = usePaperTheme();
  
  const renderCategoryBadge = (category: TaskCategory, isSelected: boolean) => {
    const categoryColor = getCategoryColor(category);
    
    return (
      <Chip
        mode={isSelected ? "flat" : "outlined"}
        selected={isSelected}
        selectedColor={theme.colors.white}
        style={[
          styles.categoryChip,
          { 
            backgroundColor: isSelected ? categoryColor : `${categoryColor}30`,
            borderColor: categoryColor
          }
        ]}
        textStyle={[
          styles.categoryText,
          isSelected && styles.selectedCategoryText
        ]}
        elevation={isSelected ? 2 : 0}
      >
        {category}
      </Chip>
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
      {showLabel && (
        <Text variant="bodyLarge" style={styles.label}>
          Category:
        </Text>
      )}
      
      <View style={styles.selector}>
        <TouchableRipple onPress={openCategoryModal}>
          {renderCategoryBadge(selectedCategory, true)}
        </TouchableRipple>
      </View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
          style={styles.modalContainer}
        >
          <Surface style={styles.modalSurface}>
            <Title style={styles.modalTitle}>Select a Category</Title>
            <Divider style={styles.divider} />
            
            <FlatList
              data={TASK_CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableRipple
                  style={styles.categoryItem}
                  onPress={() => handleSelectCategory(item)}
                >
                  <View>
                    {renderCategoryBadge(item, item === selectedCategory)}
                  </View>
                </TouchableRipple>
              )}
              contentContainerStyle={styles.categoriesList}
            />
            
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              labelStyle={styles.closeButtonText}
            >
              Cancel
            </Button>
          </Surface>
        </Modal>
      </Portal>
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
      marginRight: theme.spacing.md,
      color: theme.colors.textPrimary,
    } as TextStyle,
    selector: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryChip: {
      marginRight: theme.spacing.sm,
      height: scale(isTab ? 40 : 36),
    },
    categoryText: {
      fontSize: scaleFont(14),
      fontFamily: theme.fonts.medium,
      letterSpacing: 0.2,
    } as TextStyle,
    selectedCategoryText: {
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
    } as TextStyle,
    modalContainer: {
      justifyContent: 'flex-end',
      marginTop: 'auto',
    },
    modalContent: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    modalSurface: {
      backgroundColor: theme.colors.backgroundCard,
      borderTopLeftRadius: scale(24),
      borderTopRightRadius: scale(24),
      padding: theme.spacing.xl,
      elevation: 8,
    },
    divider: {
      height: 1,
      marginVertical: theme.spacing.md,
    },
    modalTitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    } as TextStyle,
    categoriesList: {
      paddingBottom: theme.spacing.lg,
    },
    categoryItem: {
      paddingVertical: theme.spacing.sm,
      borderRadius: 8,
      overflow: 'hidden',
    },
    closeButton: {
      marginTop: theme.spacing.lg,
      borderRadius: scale(8),
      borderColor: theme.colors.primary,
    },
    closeButtonText: {
      color: theme.colors.primary,
      fontFamily: theme.fonts.semiBold,
    } as TextStyle,
  });
});

export default CategorySelector;