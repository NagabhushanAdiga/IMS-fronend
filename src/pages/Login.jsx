import { useState } from 'react'
import {
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  LockOutlined as LockIcon,
  Inventory as InventoryIcon,
  TrendingUp,
  Assessment,
} from '@mui/icons-material'
import { authAPI } from '../services/api'

export default function Login({ onLogin }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await authAPI.login(pin)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data))
      onLogin()
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid PIN. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Left Side - Branding */}
      <Grid
        item
        xs={false}
        md={7}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          padding: 4,
        }}
      >
        <Box sx={{ maxWidth: 500, textAlign: 'center' }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 3,
            }}
          >
            <Typography sx={{ fontSize: '4rem' }}>🔧</Typography>
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Soni Traders
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Inventory Management System
          </Typography>

          <Grid container spacing={3} sx={{ mt: 4 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Real-time analytics
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                  Track your inventory performance with live data
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Smart reports
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                  Generate insights from your inventory data
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Grid>

      {/* Right Side - Login Form */}
      <Grid
        item
        xs={12}
        md={5}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ maxWidth: 450, width: '100%' }}>
          <Paper
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <LockIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography component="h1" variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Sign in to access your inventory
            </Typography>
            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="pin"
                label="Enter PIN"
                name="pin"
                type="password"
                autoFocus
                size="small"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                inputProps={{
                  maxLength: 6,
                  minLength: 4,
                  pattern: '[0-9]*',
                  inputMode: 'numeric'
                }}
                helperText="Enter your 4-digit PIN"
                InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={pin.length < 4 || loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Grid>
    </Grid>
  )
}
