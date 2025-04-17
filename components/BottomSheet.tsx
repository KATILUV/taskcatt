import React, { useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableWithoutFeedback, 
  Animated, 
  Dimensions,
  PanResponder
} from 'react-native';
import { 
  Portal,
  Modal as PaperModal,
  Surface,
  IconButton,
  Text,
  Title,
  Divider,
  useTheme as usePaperTheme
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

  // Access Paper theme
  const paperTheme = usePaperTheme();

  return (
    <Portal>
      <PaperModal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.modalContainer}
        dismissable={true}
      >
        <View style={{ flex: 1 }}>
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
                elevation: 8,
              },
            ]}
          >
            <Surface style={styles.surface}>
              <View 
                style={styles.header} 
                {...panResponder.panHandlers}
              >
                <View style={[styles.handle, { backgroundColor: theme.colors.gray }]} />
                
                {title && (
                  <View style={styles.titleContainer}>
                    <Title style={styles.title}>
                      {title}
                    </Title>
                  </View>
                )}
                
                <IconButton
                  icon="close"
                  iconColor={theme.colors.textSecondary}
                  size={24}
                  style={styles.closeButton}
                  onPress={handleClose}
                />
              </View>
              
              <Divider />
              
              <View style={styles.content}>
                {children}
              </View>
            </Surface>
          </Animated.View>
        </View>
      </PaperModal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    margin: 0, // No margins for bottom sheet
    justifyContent: 'flex-end', // Align to bottom
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  surface: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    height: 64,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
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
    right: 8,
    top: 8,
  },
  titleContainer: {
    marginTop: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: scaleFont(18),
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    padding: 24,
  },
});

export default BottomSheet;