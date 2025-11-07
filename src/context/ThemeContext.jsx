import { createContext, useState, useMemo, useEffect } from 'react'
import { createTheme } from '@mui/material/styles'

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Get saved theme from localStorage or default to 'light'
    return localStorage.getItem('themeMode') || 'light'
  })

  useEffect(() => {
    // Save theme preference to localStorage whenever it changes
    localStorage.setItem('themeMode', mode)
  }, [mode])

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
  }

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#667eea',
          },
          secondary: {
            main: '#764ba2',
          },
          ...(mode === 'light'
            ? {
                // Light mode colors
                background: {
                  default: '#ffffff',
                  paper: '#ffffff',
                },
                text: {
                  primary: '#1a202c',
                  secondary: '#4a5568',
                },
              }
            : {
                // Dark mode colors
                background: {
                  default: '#0f172a',
                  paper: '#1e293b',
                },
                text: {
                  primary: '#f1f5f9',
                  secondary: '#cbd5e1',
                },
              }),
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                boxShadow: 'none',
                border: mode === 'light' ? '1px solid #e0e0e0' : '1px solid #334155',
                backgroundImage: 'none',
              },
              elevation1: {
                boxShadow: 'none',
              },
              elevation2: {
                boxShadow: 'none',
              },
              elevation3: {
                boxShadow: 'none',
              },
              elevation4: {
                boxShadow: 'none',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: 'none',
                border: mode === 'light' ? '1px solid #e0e0e0' : '1px solid #334155',
                backgroundImage: 'none',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: 'none',
                borderBottom: mode === 'light' ? '1px solid #e0e0e0' : '1px solid #334155',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                boxShadow: 'none',
                borderRight: mode === 'light' ? '1px solid #e0e0e0' : '1px solid #334155',
                background: mode === 'light' ? '#ffffff' : '#1e293b',
                backgroundImage: 'none',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              contained: {
                boxShadow: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  boxShadow: 'none',
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                },
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                '&.Mui-selected': {
                  backgroundColor: mode === 'light' ? 'rgba(102, 126, 234, 0.08)' : 'rgba(102, 126, 234, 0.16)',
                  borderRight: '3px solid #667eea',
                  '&:hover': {
                    backgroundColor: mode === 'light' ? 'rgba(102, 126, 234, 0.12)' : 'rgba(102, 126, 234, 0.24)',
                  },
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: mode === 'light' ? '#e0e0e0' : '#334155',
                  },
                },
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [mode]
  )

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

