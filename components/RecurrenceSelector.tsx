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
  Platform,
  TextStyle
} from 'react-native';
import { 
  RecurrencePattern, 
  RecurrenceSettings, 
  RECURRENCE_PATTERNS,
  WEEK_DAYS,
  WeekDay
} from '../models/Task';
import { useTheme, createStyles } from '../utils/Theme';
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
  const { theme } = useTheme();
  const styles = useStyles();
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

const useStyles = createStyles((theme) => {
  const isTab = isTablet();
  
  return StyleSheet.create({
    container: {
      marginVertical: theme.spacing.md,
    },
    label: {
      fontSize: scaleFont(16),
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.1,
    } as TextStyle,
    selectorButton: {
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      borderRadius: 12,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.backgroundCard,
      ...theme.shadows.small,
    },
    selectorText: {
      fontSize: scaleFont(16),
      fontWeight: '500',
      fontFamily: theme.fonts.medium,
      color: theme.colors.textPrimary,
      letterSpacing: 0.15,
    } as TextStyle,
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
      backgroundColor: theme.colors.backgroundCard,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '85%',
      ...theme.shadows.large,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backgroundSecondary,
    },
    modalTitle: {
      fontSize: scaleFont(18),
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.textPrimary,
      letterSpacing: 0.2,
    } as TextStyle,
    closeButton: {
      fontSize: scaleFont(16),
      fontWeight: '500',
      fontFamily: theme.fonts.medium,
      color: theme.colors.primary,
    } as TextStyle,
    modalBody: {
      padding: theme.spacing.lg,
      maxHeight: '75%',
    },
    patternsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: theme.spacing.md,
    },
    patternButton: {
      borderWidth: 1.5,
      borderColor: theme.colors.gray,
      borderRadius: 20,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      margin: 5,
      backgroundColor: theme.colors.backgroundCard,
      ...theme.shadows.small,
    },
    patternButtonSelected: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    patternButtonText: {
      fontSize: scaleFont(14),
      fontWeight: '500',
      fontFamily: theme.fonts.medium,
      color: theme.colors.textSecondary,
      letterSpacing: 0.1,
    } as TextStyle,
    patternButtonTextSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
    } as TextStyle,
    sectionTitle: {
      fontSize: scaleFont(16),
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.1,
    } as TextStyle,
    settingSection: {
      marginVertical: theme.spacing.md,
    },
    weekDaysContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: theme.spacing.md,
      justifyContent: 'space-between',
    },
    weekdayButton: {
      borderWidth: 1.5,
      borderColor: theme.colors.gray,
      borderRadius: 20,
      padding: theme.spacing.sm,
      marginVertical: 5,
      width: scale(52),
      alignItems: 'center',
      ...theme.shadows.small,
    },
    weekdayButtonSelected: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    weekdayButtonText: {
      fontSize: scaleFont(14),
      fontWeight: '500',
      fontFamily: theme.fonts.medium,
      color: theme.colors.textSecondary,
      letterSpacing: 0.1,
    } as TextStyle,
    weekdayButtonTextSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
    } as TextStyle,
    intervalContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing.md,
    },
    intervalInput: {
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      borderRadius: 12,
      padding: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      width: scale(70),
      marginRight: theme.spacing.md,
      fontSize: scaleFont(16),
      fontWeight: '500',
      fontFamily: theme.fonts.medium,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    } as TextStyle,
    intervalLabel: {
      fontSize: scaleFont(16),
      fontWeight: '500',
      fontFamily: theme.fonts.medium,
      color: theme.colors.textPrimary,
      letterSpacing: 0.15,
    } as TextStyle,
    helperText: {
      fontSize: scaleFont(14),
      fontWeight: '400',
      fontFamily: theme.fonts.regular,
      color: theme.colors.textSecondary,
      marginVertical: theme.spacing.sm,
      letterSpacing: 0.1,
      lineHeight: 20,
    } as TextStyle,
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.backgroundSecondary,
    },
    clearButton: {
      padding: theme.spacing.md,
      borderRadius: 12,
      backgroundColor: theme.colors.backgroundSecondary,
      minWidth: scale(120),
      alignItems: 'center',
      ...theme.shadows.small,
    },
    clearButtonText: {
      fontSize: scaleFont(16),
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.textPrimary,
      letterSpacing: 0.15,
    } as TextStyle,
    confirmButton: {
      padding: theme.spacing.md,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      minWidth: scale(120),
      alignItems: 'center',
      ...theme.shadows.small,
    },
    confirmButtonText: {
      fontSize: scaleFont(16),
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.white,
      letterSpacing: 0.15,
    } as TextStyle,
  });
});