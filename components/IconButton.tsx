import React, { useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity,
  TouchableOpacityProps,
  Animated,
  ViewStyle,
  Text,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/Theme';

// Available icon variants
export type IconButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';

// Props for the IconButton component
interface IconButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  name: keyof typeof Ionicons.glyphMap;
  size?: 'small' | 'medium' | 'large';
  variant?: IconButtonVariant;
  label?: string;
  showLabel?: boolean;
  style?: ViewStyle;
  iconStyle?: ViewStyle;
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
  ...rest
}) => {
  const { theme } = useTheme();
  
  // Animation values for press feedback
  const [scale] = useState(new Animated.Value(1));
  
  // Determine icon size based on 'size' prop
  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 28;
      default: return 22;
    }
  };
  
  // Determine container size based on 'size' prop
  const getContainerSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 52;
      default: return 42;
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
  
  return (
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        disabled={disabled}
        {...rest}
        style={[
          styles.container,
          {
            width: getContainerSize(),
            height: getContainerSize(),
            backgroundColor: getBackgroundColor(),
            borderColor: getColor(),
          },
          iconStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale }],
            },
          ]}
        >
          <Ionicons
            name={name}
            size={getIconSize()}
            color={getColor()}
          />
        </Animated.View>
      </TouchableOpacity>
      
      {showLabel && label && (
        <Text
          style={[
            styles.label,
            { color: theme.colors.textSecondary },
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
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 1,
    overflow: 'hidden',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});