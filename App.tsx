import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SimpleHomeScreen from './screens/SimpleHomeScreen';
import SimpleRoutineScreen from './screens/SimpleRoutineScreen';
import { RootStackParamList } from './navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

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