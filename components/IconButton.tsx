import React, { useState } from 'react';
import { 
  StyleSheet, 
  Animated,
  ViewStyle,
  View,
  TextStyle
} from 'react-native';
import { 
  IconButton as PaperIconButton, 
  Text,
  useTheme as usePaperTheme
} from 'react-native-paper';
import { useTheme } from '../utils/Theme';
import { scale as scaleSize, scaleFont } from '../utils/ResponsiveUtils';

// Available icon variants
export type IconButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';

// Props for the IconButton component
interface IconButtonProps {
  name: string;
  size?: 'small' | 'medium' | 'large';
  variant?: IconButtonVariant;
  label?: string;
  showLabel?: boolean;
  style?: ViewStyle;
  iconStyle?: ViewStyle;
  disabled?: boolean;
  onPress?: () => void;
}

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  size = 'medium',
  variant = 'primary',
  label,
  showLabel = false,
  style,
  iconStyle,
  disabled = false,
  onPress
}) => {
  const { theme } = useTheme();
  
  // Animation values for press feedback
  const [scale] = useState(new Animated.Value(1));
  
  // Determine icon size based on 'size' prop with scaling for device size
  const getIconSize = () => {
    switch (size) {
      case 'small': return scaleFont(16);
      case 'large': return scaleFont(28);
      default: return scaleFont(22);
    }
  };
  
  // Determine container size based on 'size' prop with scaling for device size
  const getContainerSize = () => {
    switch (size) {
      case 'small': return scaleSize(32);
      case 'large': return scaleSize(52);
      default: return scaleSize(42);
    }
  };
  
  // Determine color based on variant and theme
  const getColor = (): string => {
    if (disabled) return theme.colors.textDisabled;
    
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.secondary;
      case 'danger': return theme.colors.error;
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      default: return theme.colors.primary;
    }
  };
  
  // Determine background color based on variant and theme
  const getBackgroundColor = (): string => {
    if (disabled) return theme.colors.backgroundSecondary;
    
    switch (variant) {
      case 'primary': return theme.themeType === 'dark' 
        ? 'rgba(0, 102, 204, 0.2)' 
        : 'rgba(0, 102, 204, 0.1)';
      case 'secondary': return theme.themeType === 'dark' 
        ? 'rgba(108, 117, 125, 0.2)' 
        : 'rgba(108, 117, 125, 0.1)';
      case 'danger': return theme.themeType === 'dark' 
        ? 'rgba(244, 67, 54, 0.2)' 
        : 'rgba(244, 67, 54, 0.1)';
      case 'success': return theme.themeType === 'dark' 
        ? 'rgba(76, 175, 80, 0.2)' 
        : 'rgba(76, 175, 80, 0.1)';
      case 'warning': return theme.themeType === 'dark' 
        ? 'rgba(255, 152, 0, 0.2)' 
        : 'rgba(255, 152, 0, 0.1)';
      default: return theme.themeType === 'dark' 
        ? 'rgba(0, 102, 204, 0.2)' 
        : 'rgba(0, 102, 204, 0.1)';
    }
  };
  
  // Animation functions for press interaction
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 5,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 5,
    }).start();
  };
  
  // Access Paper theme
  const paperTheme = usePaperTheme();
  
  // Convert icon name to material icon name
  const getMaterialIconName = (iconName: string): string => {
    // Basic mapping from commonly used Ionicons to Material Design icons
    const iconMap: Record<string, string> = {
      'add': 'plus',
      'checkmark': 'check',
      'close': 'close',
      'create': 'pencil',
      'trash': 'delete',
      'list': 'format-list-bulleted',
      'calendar': 'calendar',
      'person': 'account',
      'settings': 'cog',
      'search': 'magnify',
      'home': 'home',
      'add-circle': 'plus-circle',
      'arrow-back': 'arrow-left',
      'arrow-forward': 'arrow-right',
      'notifications': 'bell',
      'help-circle': 'help-circle',
      'information-circle': 'information',
      'time': 'clock',
      'heart': 'heart',
      'star': 'star',
      'refresh': 'refresh',
      'save': 'content-save',
      'share': 'share',
      'menu': 'menu',
    };
    
    return iconMap[iconName] || 'circle'; // Default to circle if no mapping exists
  };

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View
        style={{
          transform: [{ scale }],
        }}
      >
        <PaperIconButton
          icon={getMaterialIconName(name)}
          iconColor={getColor()}
          size={getIconSize()}
          onPress={onPress}
          disabled={disabled}
          style={[
            styles.container,
            {
              backgroundColor: getBackgroundColor(),
              borderColor: getColor(),
              width: getContainerSize(),
              height: getContainerSize(),
            },
            iconStyle,
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          mode="contained"
        />
      </Animated.View>
      
      {showLabel && label && (
        <Text
          variant="labelSmall"
          style={[
            styles.label,
            { 
              color: disabled ? theme.colors.textDisabled : theme.colors.textSecondary,
            }
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  } as ViewStyle,
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 1,
    overflow: 'hidden',
  } as ViewStyle,
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  label: {
    fontSize: scaleFont(12),
    marginTop: scaleSize(4),
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  } as TextStyle,
});