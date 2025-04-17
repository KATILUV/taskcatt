import React, { useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableWithoutFeedback, 
  Animated, 
  Dimensions,
  PanResponder,
  TouchableOpacity,
  Text
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/Theme';
import { scale, scaleFont } from '../utils/ResponsiveUtils';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  height?: number;
  children: React.ReactNode;
  title?: string;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ 
  visible, 
  onClose, 
  children,
  height = Dimensions.get('window').height * 0.6,
  title
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomSheetHeight = height;
  const translateY = useRef(new Animated.Value(bottomSheetHeight)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Create pan responder for drag gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > bottomSheetHeight * 0.3) {
          // Dragged down more than 30% - close sheet
          handleClose();
        } else {
          // Spring back to open position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  // Handle open/close animations
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        })
      ]).start();
    } else {
      translateY.setValue(bottomSheetHeight);
      opacity.setValue(0);
    }
  }, [visible, bottomSheetHeight, translateY, opacity]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: bottomSheetHeight,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity, backgroundColor: 'rgba(0, 0, 0, 0.5)' }]} />
      </TouchableWithoutFeedback>
      
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: bottomSheetHeight,
            paddingBottom: insets.bottom,
            backgroundColor: theme.colors.backgroundCard,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY }],
            ...theme.shadows.large,
          },
        ]}
      >
        <View 
          style={styles.header} 
          {...panResponder.panHandlers}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.gray }]} />
          
          {title && (
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                {title}
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // Shadow is now applied in the component above using theme.shadows.large
  },
  header: {
    height: 64,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  handle: {
    position: 'absolute',
    top: 12,
    width: 48,
    height: 5,
    borderRadius: 3,
    opacity: 0.6,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 8,
    borderRadius: 20,
  },
  titleContainer: {
    marginTop: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    padding: 24,
  },
});

export default BottomSheet;