import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RecurrenceSettings, RecurrencePattern, WeekDay, RECURRENCE_PATTERNS, WEEK_DAYS } from '../models/Task';

interface RecurrenceSelectorProps {
  recurrence: RecurrenceSettings | undefined;
  onRecurrenceChange: (recurrence: RecurrenceSettings | undefined) => void;
  showLabel?: boolean;
}

export default function RecurrenceSelector({ 
  recurrence, 
  onRecurrenceChange,
  showLabel = false
}: RecurrenceSelectorProps) {
  
  const getRecurrenceIcon = (pattern: RecurrencePattern): string => {
    switch (pattern) {
      case 'Daily': return 'calendar-refresh';
      case 'Weekly': return 'calendar-week';
      case 'Monthly': return 'calendar-month';
      case 'Custom': return 'calendar-edit';
      default: return 'calendar-blank';
    }
  };
  
  const getRecurrenceColor = (pattern: RecurrencePattern): string => {
    switch (pattern) {
      case 'Daily': return '#5C6BC0'; // Indigo
      case 'Weekly': return '#26A69A'; // Teal
      case 'Monthly': return '#7E57C2'; // Deep Purple
      case 'Custom': return '#78909C'; // Blue Grey
      default: return '#757575'; // Grey
    }
  };
  
  const getRecurrenceText = (recurrence?: RecurrenceSettings): string => {
    if (!recurrence) return 'None';
    
    const { pattern, interval = 1, weekDays = [] } = recurrence;
    
    switch (pattern) {
      case 'Daily':
        return interval === 1 ? 'Every day' : `Every ${interval} days`;
      case 'Weekly':
        if (weekDays.length === 0) {
          return interval === 1 ? 'Every week' : `Every ${interval} weeks`;
        } else {
          return `Every ${interval === 1 ? '' : interval + ' '}week on ${weekDays.join(', ')}`;
        }
      case 'Monthly':
        return interval === 1 ? 'Every month' : `Every ${interval} months`;
      case 'Custom':
        return 'Custom schedule';
      default:
        return 'None';
    }
  };
  
  const handlePatternChange = (pattern: RecurrencePattern) => {
    let newRecurrence: RecurrenceSettings = { 
      pattern, 
      interval: 1 
    };
    
    if (pattern === 'Weekly') {
      newRecurrence.weekDays = recurrence?.weekDays || [];
    }
    
    onRecurrenceChange(pattern === 'None' ? undefined : newRecurrence);
  };
  
  const handleWeekDayToggle = (day: WeekDay) => {
    if (!recurrence || recurrence.pattern !== 'Weekly') return;
    
    const weekDays = [...(recurrence.weekDays || [])];
    
    if (weekDays.includes(day)) {
      // Remove day
      const index = weekDays.indexOf(day);
      weekDays.splice(index, 1);
    } else {
      // Add day
      weekDays.push(day);
    }
    
    onRecurrenceChange({
      ...recurrence,
      weekDays
    });
  };
  
  const renderPattern = (pattern: RecurrencePattern, isSelected: boolean) => {
    return (
      <TouchableOpacity
        key={pattern}
        style={[
          styles.patternBadge,
          { backgroundColor: getRecurrenceColor(pattern) },
          isSelected && styles.selectedBadge
        ]}
        onPress={() => handlePatternChange(pattern)}
      >
        <MaterialCommunityIcons 
          name={getRecurrenceIcon(pattern)} 
          size={24} 
          color="white" 
        />
        {showLabel && <Text style={styles.patternLabel}>{pattern}</Text>}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.patternsContainer}
      >
        {RECURRENCE_PATTERNS.map(pattern => 
          renderPattern(pattern, recurrence?.pattern === pattern)
        )}
      </ScrollView>
      
      {recurrence?.pattern === 'Weekly' && (
        <View style={styles.weekDaysContainer}>
          {WEEK_DAYS.map(day => (
            <TouchableOpacity
              key={day}
              style={[
                styles.weekDayBadge,
                (recurrence.weekDays || []).includes(day) && styles.selectedWeekDay
              ]}
              onPress={() => handleWeekDayToggle(day)}
            >
              <Text style={styles.weekDayText}>{day.charAt(0)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {recurrence && (
        <Text style={styles.summaryText}>{getRecurrenceText(recurrence)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  patternsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  patternBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    minWidth: 44,
  },
  selectedBadge: {
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  patternLabel: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  weekDayBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  selectedWeekDay: {
    backgroundColor: '#26A69A',
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
  },
  summaryText: {
    marginTop: 8,
    fontSize: 14,
    color: '#616161',
  }
});