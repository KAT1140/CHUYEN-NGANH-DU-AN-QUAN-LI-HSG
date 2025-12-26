import { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Keyboard shortcut for theme toggle (Ctrl/Cmd + Shift + T)
  useEffect(() => {
    const handleKeyPress = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        setIsDarkMode(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Update CSS variables and localStorage when theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      // Dark mode CSS variables - Beautiful Midnight Blue Theme
      root.style.setProperty('--primary-color', '#3b82f6');
      root.style.setProperty('--primary-light', '#60a5fa');
      root.style.setProperty('--primary-dark', '#2563eb');
      root.style.setProperty('--primary-bg', '#1e293b');
      
      root.style.setProperty('--text-primary', '#f8fafc');
      root.style.setProperty('--text-secondary', '#e2e8f0');
      root.style.setProperty('--text-tertiary', '#cbd5e1');
      root.style.setProperty('--text-disabled', '#94a3b8');
      
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      root.style.setProperty('--bg-tertiary', '#334155');
      root.style.setProperty('--bg-disabled', '#475569');
      
      root.style.setProperty('--border-primary', '#475569');
      root.style.setProperty('--border-secondary', '#64748b');
      root.style.setProperty('--border-light', '#94a3b8');
      
      root.style.setProperty('--glass-bg', 'rgba(248, 250, 252, 0.08)');
      root.style.setProperty('--glass-border', 'rgba(248, 250, 252, 0.12)');
      root.style.setProperty('--gradient-start', '#0f172a');
      root.style.setProperty('--gradient-end', '#1e293b');
      
      document.body.classList.add('dark-mode');
    } else {
      // Light mode CSS variables (restore defaults)
      root.style.setProperty('--primary-color', '#1890ff');
      root.style.setProperty('--primary-light', '#40a9ff');
      root.style.setProperty('--primary-dark', '#096dd9');
      root.style.setProperty('--primary-bg', '#f0f7ff');
      
      root.style.setProperty('--text-primary', '#262626');
      root.style.setProperty('--text-secondary', '#595959');
      root.style.setProperty('--text-tertiary', '#8c8c8c');
      root.style.setProperty('--text-disabled', '#bfbfbf');
      
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#fafafa');
      root.style.setProperty('--bg-tertiary', '#f5f5f5');
      root.style.setProperty('--bg-disabled', '#f5f5f5');
      
      root.style.setProperty('--border-primary', '#d9d9d9');
      root.style.setProperty('--border-secondary', '#f0f0f0');
      root.style.setProperty('--border-light', '#f5f5f5');
      
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)');
      root.style.setProperty('--gradient-start', '#667eea');
      root.style.setProperty('--gradient-end', '#764ba2');
      
      document.body.classList.remove('dark-mode');
    }
    
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const themeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: isDarkMode ? '#3b82f6' : '#1890ff',
      borderRadius: 8,
      colorBgContainer: isDarkMode ? '#1e293b' : '#ffffff',
      colorBgElevated: isDarkMode ? '#334155' : '#ffffff',
      colorBgLayout: isDarkMode ? '#0f172a' : '#f5f5f5',
      colorText: isDarkMode ? '#f8fafc' : '#262626',
      colorTextSecondary: isDarkMode ? '#e2e8f0' : '#595959',
      colorBorder: isDarkMode ? '#475569' : '#d9d9d9',
      colorBorderSecondary: isDarkMode ? '#64748b' : '#f0f0f0',
      colorBgBase: isDarkMode ? '#0f172a' : '#ffffff',
      colorSuccess: '#10b981',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      colorInfo: isDarkMode ? '#3b82f6' : '#1890ff',
    },
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};