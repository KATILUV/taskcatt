import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SimpleHomeScreen from './screens/SimpleHomeScreen';
import SimpleRoutineScreen from './screens/SimpleRoutineScreen';
import { RootStackParamList } from './navigation/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={SimpleHomeScreen}
          options={{ title: 'Task Cat' }}
        />
        <Stack.Screen 
          name="Routine" 
          component={SimpleRoutineScreen}
          options={{ title: 'My Routines' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}