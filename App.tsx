import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Animated, Platform, ViewStyle, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  useFonts, 
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import HomeScreen from './screens/HomeScreen';
import RoutineScreen from './screens/RoutineScreen';
import { defaultTheme, useTheme } from './utils/Theme';
import { ThemeProvider } from './utils/ThemeProvider';

export type RootStackParamList = {
  Home: undefined;
  Routine: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Custom transitions
const customTransitionConfig = {
  animation: 'spring',
  config: {
    stiffness: 1000,
    damping: 50,
    mass: 3,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

// Fade-in animation for the app startup
interface FadeInViewProps {
  children: ReactNode;
  style?: ViewStyle;
  duration?: number;
}

const FadeInView: React.FC<FadeInViewProps> = ({ children, style, duration = 500 }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, duration]);

  return (
    <Animated.View style={{ ...(style as any), opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
};

// Main Navigator component that uses theme from context
const AppNavigator = () => {
  const { theme } = useTheme();
  
  // Set the status bar style based on theme
  const statusBarStyle = theme.themeType === 'dark' ? 'light' : 'dark';
  
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.white,
          headerTitleStyle: {
            fontFamily: 'Inter-SemiBold',
          },
          // Apply smooth animations to all screens by default
          animation: 'fade',
          gestureEnabled: true,
          // Custom UI settings
          contentStyle: {
            backgroundColor: theme.colors.backgroundPrimary,
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            title: 'Task Cat',
            // Custom animation for home screen
            animation: 'fade',
            headerShown: true,
            headerTransparent: false,
            // Add subtle animation
            contentStyle: {
              backgroundColor: theme.colors.backgroundPrimary,
            },
          }}
        />
        <Stack.Screen 
          name="Routine" 
          component={RoutineScreen} 
          options={{ 
            title: 'My Routines',
            // Custom animation
            animation: 'slide_from_right',
            // Subtle styling for better contrast
            contentStyle: {
              backgroundColor: theme.colors.backgroundPrimary,
            }
          }}
        />
      </Stack.Navigator>
      <StatusBar style={statusBarStyle} />
    </NavigationContainer>
  );
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const colorScheme = useColorScheme();
  
  // Load the Inter font family
  const [fontsLoaded] = useFonts({
    'Inter': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while loading resources
        await SplashScreen.preventAutoHideAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);
  
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  // Wait until fonts are loaded before rendering
  if (!fontsLoaded || !appIsReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: defaultTheme.colors.backgroundPrimary }}>
        <Text style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', fontSize: 16 }}>
          Loading Task Cat...
        </Text>
      </View>
    );
  }
  
  return (
    <ThemeProvider initialTheme="system">
      <FadeInView style={{ flex: 1 }} duration={800}>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <AppNavigator />
        </View>
      </FadeInView>
    </ThemeProvider>
  );
}