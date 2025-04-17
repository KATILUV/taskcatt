import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import RoutineScreen from './screens/RoutineScreen';

export type RootStackParamList = {
  Home: undefined;
  Routine: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
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