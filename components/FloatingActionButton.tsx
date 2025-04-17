import React, { useRef, useState } from 'react';
import { 
  StyleSheet, 
  Animated, 
  View, 
  Easing,
  Platform
} from 'react-native';
import { 
  FAB, 
  Text, 
  Surface, 
  TouchableRipple,
  Portal,
  useTheme as usePaperTheme 
} from 'react-native-paper';
import { useTheme } from '../utils/Theme';
import { scale, scaleFont } from '../utils/ResponsiveUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ActionItem {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  bgcolor?: string;
}

interface FloatingActionButtonProps {
  mainIcon?: string;
  onPress?: () => void;
  position?: 'bottomRight' | 'bottomLeft';
  color?: string;
  size?: 'small' | 'medium' | 'large';
  actions?: ActionItem[];
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  mainIcon = 'add',
  onPress,
  position = 'bottomRight',
  color,
  size = 'medium',
  actions = []
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  
  // Animations
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const actionMenuAnimation = useRef(new Animated.Value(0)).current;
  const backdropAnimation = useRef(new Animated.Value(0)).current;
  
  // Get size values based on prop
  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return { button: 46, icon: 22 };
      case 'large':
        return { button: 64, icon: 32 };
      case 'medium':
      default:
        return { button: 56, icon: 28 };
    }
  };
  
  const sizeValues = getSizeValue();
  
  // Determine position styles
  const getPositionStyle = () => {
    const basePosition = {
      position: 'absolute' as const,
      bottom: 16 + insets.bottom,
    };
    
    return position === 'bottomRight'
      ? { ...basePosition, right: 16 + insets.right }
      : { ...basePosition, left: 16 + insets.left };
  };
  
  // Handle button press
  const handlePress = () => {
    if (actions.length > 0) {
      setIsOpen(!isOpen);
      
      // Rotate animation
      Animated.timing(rotateAnimation, {
        toValue: isOpen ? 0 : 1,
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }).start();
      
      // Scale animation (press effect)
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Action menu animation
      Animated.timing(actionMenuAnimation, {
        toValue: isOpen ? 0 : 1,
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }).start();
      
      // Backdrop animation
      Animated.timing(backdropAnimation, {
        toValue: isOpen ? 0 : 0.5,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (onPress) {
      // Just execute the onPress function if no actions
      onPress();
      
      // Simple scale animation for feedback
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };
  
  // Calculate rotation based on animation value
  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });
  
  // Access Paper theme
  const paperTheme = usePaperTheme();
  
  // Convert the Ionicons name to a string that FAB can use
  const getIconName = (ionIconName: string): string => {
    // This is a mapping of common icons from Ionicons to Material Design icons used by Paper
    const iconMap: Record<string, string> = {
      'add': 'plus',
      'add-circle': 'plus-circle',
      'add-circle-outline': 'plus-circle-outline',
      'checkmark': 'check',
      'checkmark-circle': 'check-circle',
      'checkmark-circle-outline': 'check-circle-outline',
      'close': 'close',
      'close-circle': 'close-circle',
      'close-circle-outline': 'close-circle-outline',
      'create': 'pencil',
      'create-outline': 'pencil-outline',
      'trash': 'delete',
      'trash-outline': 'delete-outline',
      'list': 'format-list-bulleted',
      'list-outline': 'format-list-bulleted',
      'calendar': 'calendar',
      'calendar-outline': 'calendar-outline',
      'person': 'account',
      'person-outline': 'account-outline',
      'settings': 'cog',
      'settings-outline': 'cog-outline',
      'search': 'magnify',
      'home': 'home',
      'home-outline': 'home-outline',
      'star': 'star',
      'star-outline': 'star-outline',
      'heart': 'heart',
      'heart-outline': 'heart-outline',
      'alert': 'alert',
      'alert-outline': 'alert-outline',
      'help': 'help-circle',
      'help-outline': 'help-circle-outline',
      'information': 'information',
      'information-outline': 'information-outline'
    };
    
    return iconMap[ionIconName] || 'plus'; // Default to plus if no mapping exists
  };
  
  // Generate FAB actions from our action items
  const fabActions = actions.map(action => ({
    icon: getIconName(action.icon),
    label: action.label,
    onPress: () => {
      setIsOpen(false);
      action.onPress();
    },
    color: action.color || theme.colors.primary,
    style: { backgroundColor: action.bgcolor || theme.colors.white },
  }));
  
  return (
    <Portal>
      <View style={[styles.container, getPositionStyle()]}>
        {actions.length > 0 ? (
          <FAB.Group
            open={isOpen}
            visible
            icon={isOpen ? 'close' : getIconName(mainIcon)}
            actions={fabActions}
            onStateChange={({ open }) => setIsOpen(open)}
            onPress={() => {
              if (actions.length === 0 && onPress) {
                onPress();
              }
            }}
            fabStyle={[
              styles.fab,
              { backgroundColor: color || theme.colors.primary }
            ]}
          />
        ) : (
          <FAB
            icon={getIconName(mainIcon)}
            style={[
              styles.fab,
              { backgroundColor: color || theme.colors.primary }
            ]}
            size={size === 'small' ? 'small' : 'medium'}
            onPress={handlePress}
            mode="elevated"
            customSize={sizeValues.button}
          />
        )}
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    zIndex: 999,
  },
  fab: {
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 6,
      },
    }),
  }
});

export default FloatingActionButton;