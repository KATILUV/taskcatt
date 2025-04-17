import React from 'react';
import { 
  StyleSheet, 
  View, 
  ViewStyle,
  TextStyle
} from 'react-native';
import { 
  IconButton, 
  Text, 
  Switch,
  useTheme as usePaperTheme
} from 'react-native-paper';
import { useTheme } from '../utils/Theme';
import { Ionicons } from '@expo/vector-icons';
import { scale, scaleFont } from '../utils/ResponsiveUtils';

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
      case 'small': return 18;
      case 'large': return 26;
      default: return 22;
    }
  };
  
  const getContainerSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 48;
      default: return 40;
    }
  };
  
  // Access Paper theme
  const paperTheme = usePaperTheme();
  
  // Determine icon and size based on current theme and size prop
  const iconName = isDarkMode ? "sunny-outline" : "moon-outline";
  const iconSize = getIconSize();
  
  // Get Paper size based on our size prop
  const getPaperSize = () => {
    switch (size) {
      case 'small': return 'small';
      case 'large': return 'medium';
      default: return 'small';
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Text
          variant="labelLarge"
          style={[styles.label, { color: theme.colors.textSecondary }]}
        >
          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
        </Text>
      )}
      
      {/* First option: Use Switch component */}
      {size === 'small' && (
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          color={theme.colors.primary}
          accessibilityLabel={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        />
      )}
      
      {/* Second option: Use IconButton for medium/large sizes */}
      {size !== 'small' && (
        <IconButton
          icon={iconName}
          iconColor={theme.colors.primary}
          size={iconSize}
          mode="contained-tonal"
          onPress={toggleTheme}
          style={[
            styles.iconButton,
            {
              backgroundColor: isDarkMode 
                ? theme.colors.backgroundSecondary 
                : theme.colors.backgroundCard,
            }
          ]}
          accessibilityLabel={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  iconButton: {
    borderWidth: 1,
    borderColor: 'transparent',
  } as ViewStyle,
  label: {
    marginRight: 12,
    letterSpacing: 0.1,
  } as TextStyle
});