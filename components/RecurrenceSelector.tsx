import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  Switch,
  TextInput,
  Platform
} from 'react-native';
import { 
  RecurrencePattern, 
  RecurrenceSettings, 
  RECURRENCE_PATTERNS,
  WEEK_DAYS,
  WeekDay
} from '../models/Task';
import { theme } from '../utils/Theme';
import { scale, scaleFont, isTablet } from '../utils/ResponsiveUtils';

interface RecurrenceSelectorProps {
  recurrence: RecurrenceSettings | undefined;
  onRecurrenceChange: (recurrence: RecurrenceSettings | undefined) => void;
  showLabel?: boolean;
}

export default function RecurrenceSelector({ 
  recurrence,
  onRecurrenceChange,
  showLabel = true
}: RecurrenceSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempRecurrence, setTempRecurrence] = useState<RecurrenceSettings>(() => {
    return recurrence || { pattern: 'None' };
  });

  const getRecurrenceText = (recurrence?: RecurrenceSettings): string => {
    if (!recurrence || recurrence.pattern === 'None') {
      return 'No Recurrence';
    }

    switch (recurrence.pattern) {
      case 'Daily':
        return recurrence.interval && recurrence.interval > 1 
          ? `Every ${recurrence.interval} days` 
          : 'Daily';
          
      case 'Weekly':
        if (recurrence.weekDays && recurrence.weekDays.length > 0) {
          if (recurrence.weekDays.length === 7) {
            return 'Every day of the week';
          }
          return `Weekly on ${recurrence.weekDays.join(', ')}`;
        }
        return recurrence.interval && recurrence.interval > 1 
          ? `Every ${recurrence.interval} weeks` 
          : 'Weekly';
          
      case 'Monthly':
        if (recurrence.monthDay) {
          return `Monthly on day ${recurrence.monthDay}`;
        }
        return recurrence.interval && recurrence.interval > 1 
          ? `Every ${recurrence.interval} months` 
          : 'Monthly';
          
      case 'Custom':
        return 'Custom recurrence';
        
      default:
        return 'No Recurrence';
    }
  };

  const handlePatternChange = (pattern: RecurrencePattern) => {
    let newRecurrence: RecurrenceSettings = { 
      ...tempRecurrence,
      pattern,
      interval: 1
    };

    // Set default values based on pattern
    if (pattern === 'Weekly') {
      newRecurrence.weekDays = [WEEK_DAYS[0]]; // Default to Monday
    } else if (pattern === 'Monthly') {
      newRecurrence.monthDay = new Date().getDate(); // Default to today's date
    }

    setTempRecurrence(newRecurrence);
  };

  const handleIntervalChange = (value: string) => {
    const interval = parseInt(value);
    if (!isNaN(interval) && interval > 0) {
      setTempRecurrence({
        ...tempRecurrence,
        interval
      });
    }
  };

  const handleWeekDayToggle = (day: WeekDay) => {
    if (!tempRecurrence.weekDays) {
      setTempRecurrence({
        ...tempRecurrence,
        weekDays: [day]
      });
      return;
    }

    let newWeekDays: WeekDay[];
    if (tempRecurrence.weekDays.includes(day)) {
      // Remove day if it's already selected
      newWeekDays = tempRecurrence.weekDays.filter(d => d !== day);
      // Ensure at least one day is selected
      if (newWeekDays.length === 0) {
        newWeekDays = [day];
        return;
      }
    } else {
      // Add day if not selected
      newWeekDays = [...tempRecurrence.weekDays, day];
    }

    setTempRecurrence({
      ...tempRecurrence,
      weekDays: newWeekDays
    });
  };

  const handleMonthDayChange = (value: string) => {
    const day = parseInt(value);
    if (!isNaN(day) && day >= 1 && day <= 31) {
      setTempRecurrence({
        ...tempRecurrence,
        monthDay: day
      });
    }
  };

  const handleConfirm = () => {
    // If None is selected, pass undefined to remove recurrence
    if (tempRecurrence.pattern === 'None') {
      onRecurrenceChange(undefined);
    } else {
      onRecurrenceChange(tempRecurrence);
    }
    setModalVisible(false);
  };

  const handleClear = () => {
    setTempRecurrence({ pattern: 'None' });
    onRecurrenceChange(undefined);
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        {showLabel && <Text style={styles.label}>Recurrence</Text>}
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.selectorText}>
            {getRecurrenceText(recurrence)}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Recurrence</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Pattern Selection */}
              <Text style={styles.sectionTitle}>Recurrence Pattern</Text>
              <View style={styles.patternsContainer}>
                {RECURRENCE_PATTERNS.map((pattern) => (
                  <TouchableOpacity
                    key={pattern}
                    style={[
                      styles.patternButton,
                      tempRecurrence.pattern === pattern && styles.patternButtonSelected
                    ]}
                    onPress={() => handlePatternChange(pattern)}
                  >
                    <Text style={[
                      styles.patternButtonText,
                      tempRecurrence.pattern === pattern && styles.patternButtonTextSelected
                    ]}>
                      {pattern}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Interval Settings */}
              {tempRecurrence.pattern !== 'None' && tempRecurrence.pattern !== 'Custom' && (
                <View style={styles.settingSection}>
                  <Text style={styles.sectionTitle}>
                    {tempRecurrence.pattern === 'Daily' ? 'Repeat every X days' :
                     tempRecurrence.pattern === 'Weekly' ? 'Repeat every X weeks' :
                     'Repeat every X months'}
                  </Text>
                  <View style={styles.intervalContainer}>
                    <TextInput
                      style={styles.intervalInput}
                      keyboardType="number-pad"
                      value={String(tempRecurrence.interval || 1)}
                      onChangeText={handleIntervalChange}
                    />
                    <Text style={styles.intervalLabel}>
                      {tempRecurrence.pattern === 'Daily' ? 'day(s)' :
                       tempRecurrence.pattern === 'Weekly' ? 'week(s)' :
                       'month(s)'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Weekday Selection */}
              {tempRecurrence.pattern === 'Weekly' && (
                <View style={styles.settingSection}>
                  <Text style={styles.sectionTitle}>Repeat on</Text>
                  <View style={styles.weekDaysContainer}>
                    {WEEK_DAYS.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.weekdayButton,
                          tempRecurrence.weekDays?.includes(day) && styles.weekdayButtonSelected
                        ]}
                        onPress={() => handleWeekDayToggle(day)}
                      >
                        <Text style={[
                          styles.weekdayButtonText,
                          tempRecurrence.weekDays?.includes(day) && styles.weekdayButtonTextSelected
                        ]}>
                          {day.substring(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Month Day Selection */}
              {tempRecurrence.pattern === 'Monthly' && (
                <View style={styles.settingSection}>
                  <Text style={styles.sectionTitle}>Day of month</Text>
                  <View style={styles.intervalContainer}>
                    <TextInput
                      style={styles.intervalInput}
                      keyboardType="number-pad"
                      value={String(tempRecurrence.monthDay || 1)}
                      onChangeText={handleMonthDayChange}
                    />
                    <Text style={styles.intervalLabel}>
                      (1-31)
                    </Text>
                  </View>
                </View>
              )}

              {/* End Date Settings */}
              <View style={styles.settingSection}>
                <Text style={styles.sectionTitle}>End Date</Text>
                <Text style={styles.helperText}>
                  Task will repeat indefinitely
                </Text>
                {/* End date picker would go here in a full implementation */}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  selectorButton: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: 8,
    padding: 12,
    backgroundColor: theme.colors.white,
  },
  selectorText: {
    fontSize: scaleFont(16),
    color: theme.colors.textPrimary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  modalTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  closeButton: {
    fontSize: scaleFont(16),
    color: theme.colors.primary,
  },
  modalBody: {
    padding: 16,
    maxHeight: '70%',
  },
  patternsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  patternButton: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: theme.colors.white,
  },
  patternButtonSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  patternButtonText: {
    fontSize: scaleFont(14),
    color: theme.colors.textSecondary,
  },
  patternButtonTextSelected: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  settingSection: {
    marginVertical: 8,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
    justifyContent: 'space-between',
  },
  weekdayButton: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: 20,
    padding: 8,
    marginVertical: 4,
    width: scale(50),
    alignItems: 'center',
  },
  weekdayButtonSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  weekdayButtonText: {
    fontSize: scaleFont(14),
    color: theme.colors.textSecondary,
  },
  weekdayButtonTextSelected: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  intervalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  intervalInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: 8,
    padding: 8,
    width: scale(60),
    marginRight: 8,
    fontSize: scaleFont(16),
  },
  intervalLabel: {
    fontSize: scaleFont(16),
    color: theme.colors.textPrimary,
  },
  helperText: {
    fontSize: scaleFont(14),
    color: theme.colors.textSecondary,
    marginVertical: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  },
  clearButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.lightGray,
    minWidth: scale(100),
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: scaleFont(16),
    color: theme.colors.textPrimary,
  },
  confirmButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    minWidth: scale(100),
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: scaleFont(16),
    color: theme.colors.white,
    fontWeight: 'bold',
  },
});