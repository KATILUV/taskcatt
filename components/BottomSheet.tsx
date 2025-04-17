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
import { scale } from '../utils/ResponsiveUtils';

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
            backgroundColor: theme.colors.white,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY }],
          },
        ]}
      >
        <View 
          style={styles.header} 
          {...panResponder.panHandlers}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.lightGray }]} />
          
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  header: {
    height: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  handle: {
    position: 'absolute',
    top: 10,
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 5,
  },
  titleContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: scale(18),
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default BottomSheet;