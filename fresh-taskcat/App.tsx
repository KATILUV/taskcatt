import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import RoutineScreen from './screens/RoutineScreen';
import { RootStackParamList } from './navigation/types';

// Use Stack Navigator instead of Native Stack Navigator which was causing C++ exceptions
const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          // Customize default styling
          headerStyle: {
            backgroundColor: '#6200EE',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyle: {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Task Cat' }}
        />
        <Stack.Screen 
          name="Routine" 
          component={RoutineScreen}
          options={{ title: 'My Routines' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}