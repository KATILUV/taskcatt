import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createStyles, useTheme } from '../utils/Theme';
import { isTablet, scale, scaleFont } from '../utils/ResponsiveUtils';
import EmptyState from './EmptyState';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      errorInfo
    });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // You can render any custom fallback UI
      if (fallback) {
        return fallback;
      }

      return (
        <View style={styles.container}>
          <EmptyState
            type="error"
            title="Oops! Something went wrong"
            message={error?.message || 'An unexpected error occurred'}
            icon="alert-circle"
          />
          
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={this.resetError}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return children;
  }
}

// Creating styles outside of the component to prevent recreation on each render
const styles = createStyles((theme) => {
  const isTab = isTablet();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: theme.colors.backgroundPrimary,
    },
    errorContainer: {
      padding: 20,
      marginVertical: 20,
      backgroundColor: theme.colors.errorLight,
      borderRadius: 10,
      maxWidth: '100%',
      maxHeight: 300,
    },
    title: {
      fontSize: scaleFont(24),
      fontWeight: 'bold',
      color: theme.colors.error,
      marginBottom: 10,
      textAlign: 'center',
    },
    message: {
      fontSize: scaleFont(16),
      color: theme.colors.textPrimary,
      marginBottom: 20,
      textAlign: 'center',
    },
    errorText: {
      fontSize: scaleFont(14),
      color: theme.colors.textSecondary,
      fontFamily: 'monospace',
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 50,
      marginTop: 20,
      ...theme.shadows.medium,
    },
    retryText: {
      color: 'white',
      fontSize: scaleFont(16),
      fontWeight: 'bold',
    },
  });
});

export default ErrorBoundary;