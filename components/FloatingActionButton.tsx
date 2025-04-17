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
    // This is a simple mapping of common icons from Ionicons to Material Design icons
    // In a production app, a more complete mapping would be needed
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
      'home': 'home'
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
        {/* Action Items Menu - Using Paper Surface for elevation */}
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
              <Surface
                key={index}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: action.bgcolor || theme.colors.white,
                    marginBottom: 12,
                  },
                ]}
                elevation={3}
              >
                <TouchableRipple
                  onPress={() => {
                    setIsOpen(false);
                    actionMenuAnimation.setValue(0);
                    backdropAnimation.setValue(0);
                    rotateAnimation.setValue(0);
                    action.onPress();
                  }}
                  style={styles.touchableRipple}
                  rippleColor={`${theme.colors.primary}20`}
                >
                  <View style={styles.actionContent}>
                    <Surface
                      style={[
                        styles.actionIconContainer,
                        {
                          backgroundColor: action.color || theme.colors.primary,
                        }
                      ]}
                      elevation={2}
                    >
                      <FAB
                        icon={getIconName(action.icon)}
                        size="small"
                        style={{ backgroundColor: action.color || theme.colors.primary }}
                        color={theme.colors.white}
                        onPress={() => {}}
                        customSize={22}
                      />
                    </Surface>
                    <Text variant="labelLarge" style={{ color: theme.colors.textPrimary }}>
                      {action.label}
                    </Text>
                  </View>
                </TouchableRipple>
              </Surface>
            ))}
          </Animated.View>
        )}
        
        {/* Main FAB using Paper FAB */}
        <Animated.View
          style={{
            transform: [
              { scale: scaleAnimation },
              { rotate },
            ],
          }}
        >
          {/* Use FAB from React Native Paper */}
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
    paddingVertical: 0,
    paddingHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
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
  touchableRipple: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 16,
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