import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView,
  Platform,
  TextStyle
} from 'react-native';
import {
  Text,
  Button,
  Portal,
  Modal,
  Surface,
  TextInput,
  Chip,
  IconButton,
  Divider,
  TouchableRipple,
  Title,
  useTheme as usePaperTheme
} from 'react-native-paper';
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

  // Access Paper theme
  const paperTheme = usePaperTheme();
  
  return (
    <>
      <View style={styles.container}>
        {showLabel && <Text variant="titleMedium" style={styles.label}>Recurrence</Text>}
        <TouchableRipple
          style={styles.selectorButton}
          onPress={() => setModalVisible(true)}
          rippleColor={`${theme.colors.primary}20`}
          borderless
        >
          <View style={styles.selectorInner}>
            <Text variant="bodyLarge" style={styles.selectorText}>
              {getRecurrenceText(recurrence)}
            </Text>
            <IconButton
              icon="chevron-down"
              size={20}
              iconColor={theme.colors.primary}
            />
          </View>
        </TouchableRipple>
      </View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Title style={styles.modalTitle}>Set Recurrence</Title>
              <IconButton 
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
              />
            </View>
            <Divider />

            <ScrollView style={styles.modalBody}>
              {/* Pattern Selection */}
              <Text variant="titleMedium" style={styles.sectionTitle}>Recurrence Pattern</Text>
              <View style={styles.patternsContainer}>
                {RECURRENCE_PATTERNS.map((pattern) => (
                  <Chip
                    key={pattern}
                    selected={tempRecurrence.pattern === pattern}
                    mode={tempRecurrence.pattern === pattern ? "flat" : "outlined"}
                    style={[
                      styles.patternChip,
                      tempRecurrence.pattern === pattern && styles.patternChipSelected
                    ]}
                    textStyle={[
                      styles.patternChipText,
                      tempRecurrence.pattern === pattern && styles.patternChipTextSelected
                    ]}
                    onPress={() => handlePatternChange(pattern)}
                    showSelectedCheck={false}
                    elevation={tempRecurrence.pattern === pattern ? 2 : 0}
                  >
                    {pattern}
                  </Chip>
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
                      <Chip
                        key={day}
                        selected={tempRecurrence.weekDays?.includes(day) || false}
                        mode={tempRecurrence.weekDays?.includes(day) ? "flat" : "outlined"}
                        style={[
                          styles.weekdayChip,
                          tempRecurrence.weekDays?.includes(day) && styles.weekdayChipSelected
                        ]}
                        onPress={() => handleWeekDayToggle(day)}
                        showSelectedCheck={false}
                      >
                        {day.substring(0, 3)}
                      </Chip>
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
              <Button
                mode="outlined"
                onPress={handleClear}
                style={styles.clearButton}
                labelStyle={styles.clearButtonText}
              >
                Clear
              </Button>
              
              <Button
                mode="contained"
                onPress={handleConfirm}
                style={styles.confirmButton}
                labelStyle={styles.confirmButtonText}
              >
                Confirm
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
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
      marginBottom: theme.spacing.sm,
      color: theme.colors.textPrimary,
    } as TextStyle,
    selectorButton: {
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      borderRadius: 12,
      backgroundColor: theme.colors.backgroundCard,
      ...theme.shadows.small,
    },
    selectorInner: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    selectorText: {
      flex: 1,
      color: theme.colors.textPrimary,
      letterSpacing: 0.15,
    } as TextStyle,
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      margin: 0,
    },
    modalContent: {
      backgroundColor: theme.colors.backgroundCard,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '85%',
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    modalTitle: {
      color: theme.colors.textPrimary,
    } as TextStyle,
    modalBody: {
      padding: theme.spacing.lg,
      maxHeight: '75%',
    },
    patternsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    patternChip: {
      margin: theme.spacing.xs,
    },
    patternChipSelected: {
      backgroundColor: theme.colors.primaryLight,
    },
    patternChipText: {
      color: theme.colors.textSecondary,
    } as TextStyle,
    patternChipTextSelected: {
      color: theme.colors.primary,
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