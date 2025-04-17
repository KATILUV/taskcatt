import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Text,
  Animated,
  ViewStyle,
  TextStyle
} from 'react-native';
import { useTheme } from '../utils/Theme';
import { Ionicons } from '@expo/vector-icons';
import { scale } from '../utils/ResponsiveUtils';

interface ThemeToggleProps {
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  style, 
  size = 'medium',
  showLabel = false 
}) => {
  const { theme, themeType, toggleTheme } = useTheme();
  
  // Determine icon and label based on current theme
  const isDarkMode = themeType === 'dark' || 
    (themeType === 'system' && theme.themeType === 'dark');
  
  // Determine sizes based on the size prop
  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 24;
      default: return 20;
    }
  };
  
  const getContainerSize = () => {
    switch (size) {
      case 'small': return 28;
      case 'large': return 44;
      default: return 36;
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Text 
          style={[
            styles.label, 
            { color: theme.colors.textSecondary }
          ]}
        >
          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.button,
          { 
            backgroundColor: isDarkMode 
              ? theme.colors.backgroundSecondary 
              : theme.colors.backgroundCard,
            width: getContainerSize(),
            height: getContainerSize(),
            borderColor: theme.colors.primary,
            ...theme.shadows.small
          }
        ]}
        onPress={toggleTheme}
        accessibilityLabel={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        accessibilityHint="Changes the app color theme"
      >
        <Ionicons 
          name={isDarkMode ? "sunny" : "moon"} 
          size={getIconSize()} 
          color={theme.colors.primary} 
        />
      </TouchableOpacity>
    </View>
  );
};

const useStyles = createStyles((theme) => {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,
    button: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: scale(18),
      borderWidth: 1,
    } as ViewStyle,
    label: {
      marginRight: theme.spacing.sm,
      fontSize: theme.typography.caption.fontSize,
      fontFamily: theme.typography.caption.fontFamily,
    } as TextStyle
  });
});