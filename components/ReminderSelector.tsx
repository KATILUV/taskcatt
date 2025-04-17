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
  Switch,
  RadioButton,
  Divider,
  TouchableRipple,
  Card,
  Title,
  IconButton,
  useTheme as usePaperTheme
} from 'react-native-paper';
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

  // Access Paper theme
  const paperTheme = usePaperTheme();
  
  return (
    <>
      <View style={styles.container}>
        {showLabel && <Text variant="titleMedium" style={styles.label}>Reminder</Text>}
        <TouchableRipple
          style={styles.selectorButton}
          onPress={() => setModalVisible(true)}
          rippleColor={`${theme.colors.primary}20`}
          borderless
        >
          <View style={styles.selectorInner}>
            <Text variant="bodyLarge" style={styles.selectorText}>
              {getReminderText(reminderSettings)}
            </Text>
            <IconButton
              icon="clock-outline"
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
              <Title style={styles.modalTitle}>Set Reminder</Title>
              <IconButton 
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
              />
            </View>
            <Divider />

            <ScrollView style={styles.modalBody}>
              {/* Enable/Disable Reminder */}
              <Card style={styles.switchContainer} mode="outlined">
                <Card.Content style={styles.switchContent}>
                  <Text variant="titleMedium" style={styles.switchLabel}>Enable Reminder</Text>
                  <Switch
                    value={tempSettings.enabled}
                    onValueChange={toggleEnabled}
                    color={theme.colors.primary}
                  />
                </Card.Content>
              </Card>

              {tempSettings.enabled && (
                <>
                  {/* Time Selection */}
                  <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Reminder Time</Text>
                    <RadioButton.Group 
                      onValueChange={(value) => {
                        const option = timeOptions.find(opt => opt.label === value);
                        if (option) {
                          selectTime(option.hours, option.minutes);
                        }
                      }}
                      value={
                        timeOptions.find(opt => 
                          tempSettings.time === ((opt.hours * 60 * 60 * 1000) + (opt.minutes * 60 * 1000))
                        )?.label || ''
                      }
                    >
                      {timeOptions.map((option, index) => {
                        const timeValue = (option.hours * 60 * 60 * 1000) + (option.minutes * 60 * 1000);
                        const isSelected = tempSettings.time === timeValue;
                        
                        return (
                          <TouchableRipple
                            key={index}
                            onPress={() => selectTime(option.hours, option.minutes)}
                            style={styles.radioOption}
                          >
                            <View style={styles.radioRow}>
                              <RadioButton 
                                value={option.label} 
                                color={theme.colors.primary}
                                uncheckedColor={theme.colors.gray}
                              />
                              <Text variant="bodyMedium" style={[
                                styles.radioLabel,
                                isSelected && styles.radioLabelSelected
                              ]}>
                                {option.label}
                              </Text>
                            </View>
                          </TouchableRipple>
                        );
                      })}
                    </RadioButton.Group>
                  </View>

                  {/* Date Selection */}
                  <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Reminder Date</Text>
                    <RadioButton.Group 
                      onValueChange={(value) => {
                        const option = dateOptions.find(opt => opt.label === value);
                        if (option) {
                          selectDate(createDateOption(option.days));
                        }
                      }}
                      value={dateOptions.find(opt => {
                        const dateValue = createDateOption(opt.days);
                        return tempSettings.reminderDate === dateValue;
                      })?.label || ''}
                    >
                      {dateOptions.map((option, index) => {
                        const dateValue = createDateOption(option.days);
                        const isSelected = tempSettings.reminderDate === dateValue;
                        
                        return (
                          <TouchableRipple
                            key={index}
                            onPress={() => selectDate(dateValue)}
                            style={styles.radioOption}
                          >
                            <View style={styles.radioRow}>
                              <RadioButton 
                                value={option.label} 
                                color={theme.colors.primary}
                                uncheckedColor={theme.colors.gray}
                              />
                              <Text variant="bodyMedium" style={[
                                styles.radioLabel,
                                isSelected && styles.radioLabelSelected
                              ]}>
                                {option.label} ({getDateString(dateValue)})
                              </Text>
                            </View>
                          </TouchableRipple>
                        );
                      })}
                    </RadioButton.Group>
                  </View>

                  <Text variant="bodySmall" style={styles.helperText}>
                    For recurring tasks, reminders will be scheduled based on each instance's date and the selected time.
                  </Text>
                </>
              )}
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
    switchContainer: {
      marginVertical: theme.spacing.md,
      borderRadius: 12,
      overflow: 'hidden',
    },
    switchContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    switchLabel: {
      color: theme.colors.textPrimary,
    } as TextStyle,
    radioOption: {
      marginVertical: 4,
      borderRadius: 8,
    },
    radioRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.sm,
    },
    radioLabel: {
      flex: 1,
      marginLeft: theme.spacing.sm,
      color: theme.colors.textSecondary,
    } as TextStyle,
    radioLabelSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
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