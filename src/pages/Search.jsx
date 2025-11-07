import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material'
import {
  ShoppingCart,
  AssignmentReturn,
  Inventory,
  Search as SearchIconMui,
} from '@mui/icons-material'
import CustomSnackbar from '../components/Snackbar'

export default function Search() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setSnackbar({
        open: true,
        message: 'Please select both start and end dates',
        severity: 'error'
      })
      return
    }

    setSearching(true)
    
    try {
      // Simulate API call - Replace with actual backend call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In real implementation, fetch from backend using date range
      // const { data } = await searchAPI.getByDateRange(startDate, endDate)
      
      // For now, show message that this needs backend integration
      setResults(null)
      setSnackbar({
        open: true,
        message: 'Date range search feature requires backend API integration',
        severity: 'info'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Search failed',
        severity: 'error'
      })
    } finally {
      setSearching(false)
    }
  }

  const handleReset = () => {
    setStartDate('')
    setEndDate('')
    setResults(null)
  }

  const StatCard = ({ title, value, subtitle, icon, gradient }) => (
    <Card>
      <CardContent sx={{ py: 2, px: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography color="textSecondary" gutterBottom variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          <Box
            sx={{
              background: gradient,
              borderRadius: 1.5,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Date Range Search
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Select Date Range
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSearch}
                disabled={searching}
                startIcon={searching ? <CircularProgress size={20} color="inherit" /> : <SearchIconMui />}
              >
                {searching ? 'Searching...' : 'Search'}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleReset}
                disabled={searching}
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {results && (
        <>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
            Results for {startDate} to {endDate}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Items Sold"
                value={results.itemsSold}
                subtitle={`Total Value: ₹${results.soldValue.toFixed(2)}`}
                icon={<ShoppingCart sx={{ color: 'white', fontSize: 32 }} />}
                gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Items Returned"
                value={results.itemsReturned}
                subtitle={`Total Value: ₹${results.returnedValue.toFixed(2)}`}
                icon={<AssignmentReturn sx={{ color: 'white', fontSize: 32 }} />}
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Items Available"
                value={results.itemsAvailable}
                subtitle={`Total Value: ₹${results.availableValue.toFixed(2)}`}
                icon={<Inventory sx={{ color: 'white', fontSize: 32 }} />}
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
            </Grid>
          </Grid>

          <Paper sx={{ p: 2.5, mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 1, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Net Sales (Sold - Returned)
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main', mt: 0.5 }}>
                    {results.itemsSold - results.itemsReturned} items
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    ₹{(results.soldValue - results.returnedValue).toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', borderRadius: 1, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Return Rate
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main', mt: 0.5 }}>
                    {((results.itemsReturned / results.itemsSold) * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {results.itemsReturned} of {results.itemsSold} items
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}

      {!results && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SearchIconMui sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Select a date range and click Search to view results
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Note: This feature requires backend API integration for date-based searches
          </Typography>
        </Box>
      )}

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  )
}

