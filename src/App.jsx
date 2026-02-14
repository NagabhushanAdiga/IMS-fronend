import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, ThemeContext } from './context/ThemeContext'

import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Folder from './pages/Folder'
import FolderItems from './pages/FolderItems'
import Sales from './pages/Sales'
import Returns from './pages/Returns'
import Search from './pages/Search'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Developer from './pages/Developer'
import Invoice from './pages/Invoice'

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  )

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="folder" element={<Folder />} />
          <Route path="folder/:folderId" element={<FolderItems />} />
          <Route path="sales" element={<Sales />} />
          <Route path="returns" element={<Returns />} />
          <Route path="invoice" element={<Invoice />} />
          <Route path="search" element={<Search />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="developer" element={<Developer />} />
        </Route>
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ThemeContext.Consumer>
        {({ theme }) => (
          <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <AppContent />
          </MuiThemeProvider>
        )}
      </ThemeContext.Consumer>
    </ThemeProvider>
  )
}

export default App
