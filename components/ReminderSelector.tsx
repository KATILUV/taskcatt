import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  Switch,
  Platform,
  TextStyle
} from 'react-native';
import { ReminderSettings } from '../models/Task';
import { useTheme, createStyles } from '../utils/Theme';
import { scale, scaleFont, isTablet } from '../utils/ResponsiveUtils';

interface ReminderSelectorProps {
  reminderSettings: ReminderSettings | undefined;
  onReminderChange: (reminderSettings: ReminderSettings | undefined) => void;
  showLabel?: boolean;
}

export default function ReminderSelector({ 
  reminderSettings,
  onReminderChange,
  showLabel = true
}: ReminderSelectorProps) {
  const { theme } = useTheme();
  const styles = useStyles();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempSettings, setTempSettings] = useState<ReminderSettings>(() => {
    return reminderSettings || { enabled: false };
  });

  // Convert milliseconds to formatted time string (HH:MM AM/PM)
  const getTimeString = (millisSinceMidnight?: number): string => {
    if (!millisSinceMidnight) return 'Set time';
    
    const hours = Math.floor(millisSinceMidnight / (60 * 60 * 1000));
    const minutes = Math.floor((millisSinceMidnight % (60 * 60 * 1000)) / (60 * 1000));
    
    let hourDisplay = hours % 12;
    if (hourDisplay === 0) hourDisplay = 12;
    
    const minuteDisplay = minutes < 10 ? `0${minutes}` : minutes;
    const period = hours >= 12 ? 'PM' : 'AM';
    
    return `${hourDisplay}:${minuteDisplay} ${period}`;
  };

  // Format a date for display
  const getDateString = (timestamp?: number): string => {
    if (!timestamp) return 'Set date';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get summary text for the reminder setting
  const getReminderText = (settings?: ReminderSettings): string => {
    if (!settings || !settings.enabled) {
      return 'No Reminder';
    }

    if (settings.reminderDate) {
      return `Remind on ${getDateString(settings.reminderDate)}`;
    }

    if (settings.time) {
      return `Remind at ${getTimeString(settings.time)}`;
    }

    return 'Reminder enabled';
  };

  // Toggle the reminder on/off
  const toggleEnabled = (value: boolean) => {
    setTempSettings({
      ...tempSettings,
      enabled: value
    });
  };

  // Set the time (milliseconds since midnight)
  const selectTime = (hours: number, minutes: number) => {
    const millisSinceMidnight = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
    setTempSettings({
      ...tempSettings,
      time: millisSinceMidnight
    });
  };

  // Set a specific date for the reminder
  const selectDate = (timestamp: number) => {
    setTempSettings({
      ...tempSettings,
      reminderDate: timestamp
    });
  };

  // Handle save and update parent component
  const handleConfirm = () => {
    onReminderChange(tempSettings.enabled ? tempSettings : undefined);
    setModalVisible(false);
  };

  // Clear the reminder
  const handleClear = () => {
    setTempSettings({ enabled: false });
    onReminderChange(undefined);
    setModalVisible(false);
  };

  // For the demo, we'll simulate time selection with predefined times
  const timeOptions = [
    { label: 'Morning (9:00 AM)', hours: 9, minutes: 0 },
    { label: 'Noon (12:00 PM)', hours: 12, minutes: 0 },
    { label: 'Afternoon (3:00 PM)', hours: 15, minutes: 0 },
    { label: 'Evening (6:00 PM)', hours: 18, minutes: 0 },
    { label: 'Night (9:00 PM)', hours: 21, minutes: 0 }
  ];

  // For the demo, we'll simulate date selection with predefined dates
  const dateOptions = [
    { label: 'Today', days: 0 },
    { label: 'Tomorrow', days: 1 },
    { label: 'In 2 days', days: 2 },
    { label: 'In 1 week', days: 7 },
    { label: 'In 2 weeks', days: 14 }
  ];

  // Create a date option
  const createDateOption = (days: number): number => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    // Set time to 9 AM
    date.setHours(9, 0, 0, 0);
    return date.getTime();
  };

  return (
    <>
      <View style={styles.container}>
        {showLabel && <Text style={styles.label}>Reminder</Text>}
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.selectorText}>
            {getReminderText(reminderSettings)}
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
              <Text style={styles.modalTitle}>Set Reminder</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Enable/Disable Reminder */}
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Enable Reminder</Text>
                <Switch
                  value={tempSettings.enabled}
                  onValueChange={toggleEnabled}
                  trackColor={{ false: theme.colors.lightGray, true: theme.colors.primaryLight }}
                  thumbColor={tempSettings.enabled ? theme.colors.primary : theme.colors.gray}
                />
              </View>

              {tempSettings.enabled && (
                <>
                  {/* Time Selection */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reminder Time</Text>
                    <View style={styles.optionsContainer}>
                      {timeOptions.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.optionButton,
                            tempSettings.time === ((option.hours * 60 * 60 * 1000) + (option.minutes * 60 * 1000)) && 
                              styles.optionButtonSelected
                          ]}
                          onPress={() => selectTime(option.hours, option.minutes)}
                        >
                          <Text style={[
                            styles.optionButtonText,
                            tempSettings.time === ((option.hours * 60 * 60 * 1000) + (option.minutes * 60 * 1000)) && 
                              styles.optionButtonTextSelected
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Date Selection */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reminder Date</Text>
                    <View style={styles.optionsContainer}>
                      {dateOptions.map((option, index) => {
                        const dateValue = createDateOption(option.days);
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.optionButton,
                              tempSettings.reminderDate === dateValue && styles.optionButtonSelected
                            ]}
                            onPress={() => selectDate(dateValue)}
                          >
                            <Text style={[
                              styles.optionButtonText,
                              tempSettings.reminderDate === dateValue && styles.optionButtonTextSelected
                            ]}>
                              {option.label} ({getDateString(dateValue)})
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <Text style={styles.helperText}>
                    For recurring tasks, reminders will be scheduled based on each instance's date and the selected time.
                  </Text>
                </>
              )}
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
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: theme.spacing.md,
      backgroundColor: theme.colors.backgroundSecondary,
      padding: theme.spacing.md,
      borderRadius: 12,
    },
    switchLabel: {
      fontSize: scaleFont(16),
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.textPrimary,
      letterSpacing: 0.15,
    } as TextStyle,
    section: {
      marginVertical: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: scaleFont(16),
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.15,
    } as TextStyle,
    optionsContainer: {
      marginVertical: theme.spacing.sm,
    },
    optionButton: {
      borderWidth: 1.5,
      borderColor: theme.colors.backgroundSecondary,
      borderRadius: 12,
      padding: theme.spacing.md,
      marginVertical: 6,
      backgroundColor: theme.colors.backgroundCard,
      ...theme.shadows.small,
    },
    optionButtonSelected: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
      ...theme.shadows.small,
    },
    optionButtonText: {
      fontSize: scaleFont(15),
      fontWeight: '500',
      fontFamily: theme.fonts.medium,
      color: theme.colors.textSecondary,
      letterSpacing: 0.15,
    } as TextStyle,
    optionButtonTextSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontFamily: theme.fonts.semiBold,
    } as TextStyle,
    helperText: {
      fontSize: scaleFont(14),
      fontWeight: '400',
      fontFamily: theme.fonts.regular,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      lineHeight: 20,
      letterSpacing: 0.1,
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