import React, { useRef, useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  View, 
  Text,
  Easing,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  
  return (
    <>
      {/* Backdrop for when menu is open */}
      {actions.length > 0 && (
        <Animated.View 
          style={[
            styles.backdrop,
            {
              backgroundColor: theme.colors.black,
              opacity: backdropAnimation,
              display: isOpen ? 'flex' : 'none',
            },
          ]}
          pointerEvents={isOpen ? 'auto' : 'none'}
          onTouchStart={() => handlePress()}
        />
      )}
      
      <View style={[styles.container, getPositionStyle()]}>
        {/* Action Items Menu */}
        {actions.length > 0 && (
          <Animated.View
            style={[
              styles.actionsContainer,
              {
                opacity: actionMenuAnimation,
                transform: [
                  {
                    translateY: actionMenuAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
                display: isOpen ? 'flex' : 'none',
              },
            ]}
            pointerEvents={isOpen ? 'auto' : 'none'}
          >
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: action.bgcolor || theme.colors.white,
                    marginBottom: 12,
                  },
                ]}
                onPress={() => {
                  setIsOpen(false);
                  actionMenuAnimation.setValue(0);
                  backdropAnimation.setValue(0);
                  rotateAnimation.setValue(0);
                  action.onPress();
                }}
              >
                <View style={styles.actionContent}>
                  <View 
                    style={[
                      styles.actionIconContainer,
                      {
                        backgroundColor: action.color || theme.colors.primary,
                      }
                    ]}
                  >
                    <Ionicons
                      name={action.icon as any}
                      size={22}
                      color={theme.colors.white}
                    />
                  </View>
                  <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>
                    {action.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
        
        {/* Main FAB */}
        <Animated.View
          style={[
            {
              transform: [
                { scale: scaleAnimation },
                { rotate },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.fab,
              {
                backgroundColor: color || theme.colors.primary,
                width: sizeValues.button,
                height: sizeValues.button,
                borderRadius: sizeValues.button / 2,
              },
            ]}
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <Ionicons
              name={mainIcon as any}
              size={sizeValues.icon}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
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
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 70, // Position above the main FAB
    flexDirection: 'column-reverse',
    alignItems: 'flex-end',
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionLabel: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    marginLeft: 4,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 998,
  },
});

export default FloatingActionButton;