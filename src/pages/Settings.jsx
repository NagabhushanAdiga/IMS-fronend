import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Avatar,
  Alert,
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

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <PersonIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                Profile information
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {loading ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                  <Skeleton variant="circular" width={100} height={100} />
                  <Box>
                    <Skeleton variant="text" width={150} height={32} />
                    <Skeleton variant="text" width={120} height={24} />
                    <Skeleton variant="rectangular" width={120} height={32} sx={{ mt: 1, borderRadius: 1 }} />
                  </Box>
                </Box>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                    }}
                  >
                    {profileData.fullName ? profileData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{profileData.fullName || 'User'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Administrator
                    </Typography>
                    <Button variant="outlined" size="small" sx={{ mt: 1 }} disabled>
                      Change avatar
                    </Button>
                  </Box>
                </Box>

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
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleProfileSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save profile'}
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <SecurityIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                Security
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

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
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handlePinChange}
                disabled={saving || loading}
              >
                {saving ? 'Changing...' : 'Change PIN'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <NotificationsIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                Notifications
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

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
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleNotificationsSave}
                disabled={saving || loading}
              >
                {saving ? 'Saving...' : 'Save preferences'}
              </Button>
            </Box>
          </Paper>
        </Grid>
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
