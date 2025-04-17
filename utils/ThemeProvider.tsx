import React, { useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { ThemeContext, ThemeType, createTheme } from './Theme';

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeType;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme = 'system'
}) => {
  // Set initial theme state
  const [themeType, setThemeType] = useState<ThemeType>(initialTheme);
  
  // Calculate the actual theme object based on theme type and system preference
  const [theme, setTheme] = useState(() => createTheme(themeType));
  
  // Toggle between light and dark theme (ignoring system)
  const toggleTheme = () => {
    setThemeType(prevTheme => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'light';
      
      // If system, use the opposite of the current appearance
      const systemTheme = Appearance.getColorScheme() || 'light';
      return systemTheme === 'dark' ? 'light' : 'dark';
    });
  };
  
  // Update the theme when themeType changes
  useEffect(() => {
    setTheme(createTheme(themeType));
  }, [themeType]);
  
  // Listen for system theme changes if using 'system' theme
  useEffect(() => {
    if (themeType !== 'system') return;
    
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(createTheme(colorScheme));
    });
    
    return () => {
      subscription.remove();
    };
  }, [themeType]);
  
  return (
    <ThemeContext.Provider 
      value={{
        theme,
        themeType,
        toggleTheme,
        setThemeType,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};