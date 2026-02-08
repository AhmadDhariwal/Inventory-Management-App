const helloService = require("../services/hello.service");

const getThemeStatus = async (req, res) => {
  try {
    const theme = await helloService.getCurrentTheme();
    res.status(200).json({
      success: true,
      data: {
        currentTheme: theme,
        isDarkMode: theme === 'dark',
        availableThemes: ['light', 'dark', 'auto'],
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleDarkMode = async (req, res) => {
  try {
    const { theme } = req.body;
    const result = await helloService.setTheme(theme);
    
    res.status(200).json({
      success: true,
      message: `Theme switched to ${result.theme} mode`,
      data: {
        previousTheme: result.previousTheme,
        currentTheme: result.theme,
        isDarkMode: result.theme === 'dark',
        visualRepresentation: getVisualRepresentation(result.theme),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVisualRepresentation = (theme) => {
  const representations = {
    light: {
      background: '#ffffff',
      foreground: '#000000',
      card: '#f8f9fa',
      text: '#212529',
      border: '#dee2e6',
      accent: '#007bff',
      emoji: '☀️',
      description: 'Bright and clean interface with high contrast'
    },
    dark: {
      background: '#1a1a1a',
      foreground: '#ffffff',
      card: '#2d2d2d',
      text: '#e9ecef',
      border: '#495057',
      accent: '#0d6efd',
      emoji: '🌙',
      description: 'Easy on the eyes with reduced blue light'
    },
    auto: {
      background: 'system',
      foreground: 'system',
      card: 'system',
      text: 'system',
      border: 'system',
      accent: 'system',
      emoji: '🔄',
      description: 'Automatically follows system preferences'
    }
  };
  
  return representations[theme] || representations.light;
};

const getThemePreview = async (req, res) => {
  try {
    const { theme } = req.query;
    const preview = getVisualRepresentation(theme || 'light');
    
    res.status(200).json({
      success: true,
      data: {
        theme: theme || 'light',
        preview: preview,
        sampleUI: {
          header: {
            background: preview.background,
            text: preview.text,
            border: preview.border
          },
          sidebar: {
            background: preview.card,
            text: preview.text,
            accent: preview.accent
          },
          mainContent: {
            background: preview.background,
            card: preview.card,
            text: preview.text
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getThemeStatistics = async (req, res) => {
  try {
    const stats = await helloService.getThemeStatistics();
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers: stats.totalUsers,
        darkModeUsers: stats.darkModeUsers,
        lightModeUsers: stats.lightModeUsers,
        autoModeUsers: stats.autoModeUsers,
        percentages: {
          darkMode: ((stats.darkModeUsers / stats.totalUsers) * 100).toFixed(1),
          lightMode: ((stats.lightModeUsers / stats.totalUsers) * 100).toFixed(1),
          autoMode: ((stats.autoModeUsers / stats.totalUsers) * 100).toFixed(1)
        },
        chartData: [
          { name: 'Dark Mode', value: stats.darkModeUsers, color: '#1a1a1a' },
          { name: 'Light Mode', value: stats.lightModeUsers, color: '#f8f9fa' },
          { name: 'Auto Mode', value: stats.autoModeUsers, color: '#007bff' }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetTheme = async (req, res) => {
  try {
    const result = await helloService.resetTheme();
    
    res.status(200).json({
      success: true,
      message: 'Theme reset to default',
      data: {
        defaultTheme: result.theme,
        visualRepresentation: getVisualRepresentation(result.theme),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getThemeStatus,
  toggleDarkMode,
  getThemePreview,
  getThemeStatistics,
  resetTheme
};