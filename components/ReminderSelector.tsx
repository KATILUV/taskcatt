import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ReminderSettings } from '../models/Task';

interface ReminderSelectorProps {
  reminderSettings: ReminderSettings | undefined;
  onReminderChange: (reminderSettings: ReminderSettings | undefined) => void;
  showLabel?: boolean;
}

export default function ReminderSelector({ 
  reminderSettings, 
  onReminderChange,
  showLabel = false
}: ReminderSelectorProps) {
  
  const toggleReminder = () => {
    if (!reminderSettings) {
      // Create new reminder with default settings
      onReminderChange({
        enabled: true,
        time: new Date().setHours(9, 0, 0, 0) % 86400000 // 9:00 AM
      });
    } else {
      // Toggle enabled state
      onReminderChange({
        ...reminderSettings,
        enabled: !reminderSettings.enabled
      });
    }
  };
  
  const getReminderText = (settings?: ReminderSettings): string => {
    if (!settings || !settings.enabled) return 'No reminder';
    
    if (settings.reminderDate) {
      // One-time reminder
      const date = new Date(settings.reminderDate);
      return `Once on ${date.toLocaleDateString()} at ${formatTime(settings.time || 0)}`;
    } else {
      // Recurring reminder
      return `At ${formatTime(settings.time || 0)}`;
    }
  };
  
  const formatTime = (timeMs: number): string => {
    const hours = Math.floor(timeMs / 3600000);
    const minutes = Math.floor((timeMs % 3600000) / 60000);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name="bell" 
            size={24} 
            color={(reminderSettings?.enabled ? '#FF9800' : '#BDBDBD')}
          />
          {showLabel && (
            <Text style={[
              styles.label, 
              { color: (reminderSettings?.enabled ? '#424242' : '#9E9E9E') }
            ]}>
              Reminder
            </Text>
          )}
        </View>
        
        <Switch
          value={reminderSettings?.enabled || false}
          onValueChange={toggleReminder}
          trackColor={{ false: '#E0E0E0', true: '#FFCC80' }}
          thumbColor={reminderSettings?.enabled ? '#FF9800' : '#BDBDBD'}
        />
      </View>
      
      {(reminderSettings?.enabled) && (
        <View style={styles.timeSelector}>
          <Text style={styles.timeText}>{getReminderText(reminderSettings)}</Text>
          
          {/* In a real app, we'd have a time picker here */}
          <TouchableOpacity 
            style={styles.timePickerButton}
            onPress={() => {
              // Simulate picking a time by setting to random time
              const hours = Math.floor(Math.random() * 24);
              const minutes = Math.floor(Math.random() * 12) * 5;
              const newTimeMs = (hours * 3600000) + (minutes * 60000);
              
              onReminderChange({
                ...reminderSettings,
                time: newTimeMs
              });
            }}
          >
            <MaterialCommunityIcons name="clock-edit" size={20} color="#FF9800" />
            <Text style={styles.timePickerText}>Change Time</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  timeSelector: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  timeText: {
    fontSize: 14,
    color: '#616161',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#FFF3E0',
    alignSelf: 'flex-start',
  },
  timePickerText: {
    marginLeft: 4,
    color: '#F57C00',
    fontWeight: '500',
  }
});