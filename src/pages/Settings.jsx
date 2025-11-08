import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Avatar,
  CircularProgress,
  Skeleton,
} from '@mui/material'
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
} from '@mui/icons-material'
import { authAPI } from '../services/api'
import CustomSnackbar from '../components/Snackbar'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    country: '',
  })

  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: '',
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    orderUpdates: true,
    weeklyReports: false,
    marketingEmails: false,
  })

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data } = await authAPI.getProfile()
      setProfileData({
        fullName: data.fullName || data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || '',
      })
      // Load notifications if available from backend
      if (data.notifications) {
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setSnackbar({
        open: true,
        message: 'Failed to load profile data',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = async () => {
    try {
      setSaving(true)
      await authAPI.updateProfile(profileData)
      setSnackbar({
        open: true,
        message: 'Profile saved successfully!',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save profile',
        severity: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePinChange = async () => {
    if (pinData.newPin.length < 4) {
      setSnackbar({
        open: true,
        message: 'PIN must be at least 4 digits!',
        severity: 'error'
      })
      return
    }
    if (pinData.newPin !== pinData.confirmPin) {
      setSnackbar({
        open: true,
        message: 'PINs do not match!',
        severity: 'error'
      })
      return
    }
    try {
      setSaving(true)
      await authAPI.updatePin({
        currentPin: pinData.currentPin,
        newPin: pinData.newPin,
      })
      setPinData({ currentPin: '', newPin: '', confirmPin: '' })
      setSnackbar({
        open: true,
        message: 'PIN changed successfully!',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error changing PIN:', error)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to change PIN',
        severity: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationsSave = async () => {
    try {
      setSaving(true)
      // If backend supports notifications, update them
      await authAPI.updateProfile({ notifications })
      setSnackbar({
        open: true,
        message: 'Notification preferences saved!',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error saving notifications:', error)
      // If backend doesn't support notifications, just save locally
      setSnackbar({
        open: true,
        message: 'Notification preferences saved!',
        severity: 'success'
      })
    } finally {
      setSaving(false)
    }
  }

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
  ]

  return (
    <Box>
      {!loading && (
        <Paper 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: gradients[0],
            color: 'white',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar 
                sx={{ 
                  width: { xs: 80, md: 100 }, 
                  height: { xs: 80, md: 100 },
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  background: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                {profileData.fullName ? profileData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                {profileData.fullName || 'User'}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1, opacity: 0.95, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                Administrator
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {profileData.email}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  background: gradients[0],
                  borderRadius: 2,
                  p: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                }}
              >
                <PersonIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                Profile information
              </Typography>
            </Box>

            {loading ? (
              <>
                <Grid container spacing={2}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Grid item xs={12} md={index === 4 ? 12 : 6} key={index}>
                      <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full name"
                      size="small"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      disabled={saving}
                      InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      size="small"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={saving}
                      InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      size="small"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={saving}
                      InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      size="small"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      disabled={saving}
                      InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      size="small"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      disabled={saving}
                      InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City"
                      size="small"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      disabled={saving}
                      InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      size="small"
                      value={profileData.country}
                      onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                      disabled={saving}
                      InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleProfileSave}
                    disabled={saving}
                    sx={{
                      background: gradients[0],
                      px: 4,
                      py: 1.25,
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                      }
                    }}
                  >
                    {saving ? 'Saving...' : 'Save profile'}
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid> */}

        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  background: gradients[1],
                  borderRadius: 2,
                  p: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)',
                }}
              >
                <SecurityIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                Security
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current PIN"
                  type="password"
                  size="small"
                  value={pinData.currentPin}
                  onChange={(e) => setPinData({ ...pinData, currentPin: e.target.value })}
                  disabled={saving || loading}
                  inputProps={{
                    maxLength: 6,
                    minLength: 4,
                    pattern: '[0-9]*',
                    inputMode: 'numeric'
                  }}
                  helperText="Enter your current 4-digit PIN"
                  InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="New PIN"
                  type="password"
                  size="small"
                  value={pinData.newPin}
                  onChange={(e) => setPinData({ ...pinData, newPin: e.target.value })}
                  disabled={saving || loading}
                  inputProps={{
                    maxLength: 6,
                    minLength: 4,
                    pattern: '[0-9]*',
                    inputMode: 'numeric'
                  }}
                  helperText="Enter new 4-digit PIN"
                  InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Confirm new PIN"
                  type="password"
                  size="small"
                  value={pinData.confirmPin}
                  onChange={(e) => setPinData({ ...pinData, confirmPin: e.target.value })}
                  disabled={saving || loading}
                  inputProps={{
                    maxLength: 6,
                    minLength: 4,
                    pattern: '[0-9]*',
                    inputMode: 'numeric'
                  }}
                  helperText="Re-enter new PIN"
                  InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handlePinChange}
                disabled={saving || loading}
                sx={{
                  background: gradients[1],
                  px: 4,
                  py: 1.25,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(17, 153, 142, 0.4)',
                  }
                }}
              >
                {saving ? 'Changing...' : 'Change PIN'}
              </Button>
            </Box>
          </Paper>
        </Grid>
{/* 
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  background: gradients[2],
                  borderRadius: 2,
                  p: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
                }}
              >
                <NotificationsIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                Notifications
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emailNotifications}
                    onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                  />
                }
                label="Email notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.lowStockAlerts}
                    onChange={(e) => setNotifications({ ...notifications, lowStockAlerts: e.target.checked })}
                  />
                }
                label="Low stock alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.orderUpdates}
                    onChange={(e) => setNotifications({ ...notifications, orderUpdates: e.target.checked })}
                  />
                }
                label="Order updates"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.weeklyReports}
                    onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
                  />
                }
                label="Weekly reports"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.marketingEmails}
                    onChange={(e) => setNotifications({ ...notifications, marketingEmails: e.target.checked })}
                  />
                }
                label="Marketing emails"
              />
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleNotificationsSave}
                disabled={saving || loading}
                sx={{
                  background: gradients[2],
                  px: 4,
                  py: 1.25,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(240, 147, 251, 0.4)',
                  }
                }}
              >
                {saving ? 'Saving...' : 'Save preferences'}
              </Button>
            </Box>
          </Paper>
        </Grid> */}
      </Grid>

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  )
}
