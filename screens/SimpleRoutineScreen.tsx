import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export default function SimpleRoutineScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Routine'>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Routine Screen</Text>
      <Button 
        title="Go back to Home" 
        onPress={() => navigation.goBack()} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});