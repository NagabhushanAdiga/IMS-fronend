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
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
} from '@mui/material'
import {
  ShoppingCart,
  AssignmentReturn,
  Inventory,
  Search as SearchIconMui,
} from '@mui/icons-material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { productAPI } from '../services/api'
import { AccordionSkeleton } from '../components/Loading'
import CustomSnackbar from '../components/Snackbar'

export default function Search() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'sold', 'returned', 'inStock'
  const [results, setResults] = useState(null)
  const [items, setItems] = useState([])
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
      // Fetch all products from backend
      const { data } = await productAPI.getAll({ startDate, endDate })
      const allItems = data.products || []

      // Calculate statistics
      const itemsSold = allItems.reduce((sum, item) => sum + (item.sold || 0), 0)
      const itemsReturned = allItems.reduce((sum, item) => sum + (item.returned || 0), 0)
      const itemsAvailable = allItems.reduce((sum, item) => sum + (item.stock || 0), 0)
      const soldValue = allItems.reduce((sum, item) => sum + ((item.sold || 0) * (item.price || 0)), 0)
      const returnedValue = allItems.reduce((sum, item) => sum + ((item.returned || 0) * (item.price || 0)), 0)
      const availableValue = allItems.reduce((sum, item) => sum + ((item.stock || 0) * (item.price || 0)), 0)

      setResults({
        itemsSold,
        itemsReturned,
        itemsAvailable,
        soldValue,
        returnedValue,
        availableValue,
      })

      setItems(allItems)

      setSnackbar({
        open: true,
        message: `Found ${allItems.length} items in the selected date range`,
        severity: 'success'
      })
    } catch (error) {
      console.error('Error searching:', error)
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
    setFilter('all')
    setResults(null)
    setItems([])
  }

  // Filter items based on selected filter
  const getFilteredItems = () => {
    if (!items.length) return []

    switch (filter) {
      case 'sold':
        return items.filter(item => (item.sold || 0) > 0)
      case 'returned':
        return items.filter(item => (item.returned || 0) > 0)
      case 'inStock':
        return items.filter(item => (item.stock || 0) > 0)
      default:
        return items
    }
  }

  const filteredItems = getFilteredItems()

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
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
          Select date range
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              label="Start date"
              type="date"
              fullWidth
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
                sx: { fontSize: '0.875rem' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="End date"
              type="date"
              fullWidth
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
                sx: { fontSize: '0.875rem' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Filter by status"
              select
              fullWidth
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            >
              <MenuItem value="all">All items</MenuItem>
              <MenuItem value="sold">Sold items</MenuItem>
              <MenuItem value="returned">Returned items</MenuItem>
              <MenuItem value="inStock">Items in stock</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
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
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Items sold"
                value={results.itemsSold}
                subtitle={`Total value: ₹${results.soldValue.toFixed(2)}`}
                icon={<ShoppingCart sx={{ color: 'white', fontSize: 32 }} />}
                gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Items returned"
                value={results.itemsReturned}
                subtitle={`Total value: ₹${results.returnedValue.toFixed(2)}`}
                icon={<AssignmentReturn sx={{ color: 'white', fontSize: 32 }} />}
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Items in stock"
                value={results.itemsAvailable}
                subtitle={`Total value: ₹${results.availableValue.toFixed(2)}`}
                icon={<Inventory sx={{ color: 'white', fontSize: 32 }} />}
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
            </Grid>
          </Grid>

          <Paper sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 1, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Net sales (sold - returned)
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
                    Return rate
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main', mt: 0.5 }}>
                    {results.itemsSold > 0 ? ((results.itemsReturned / results.itemsSold) * 100).toFixed(1) : 0}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {results.itemsReturned} of {results.itemsSold} items
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Items List */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Items ({filteredItems.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`All (${items.length})`}
                  color={filter === 'all' ? 'primary' : 'default'}
                  onClick={() => setFilter('all')}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
                <Chip
                  label={`Sold (${items.filter(i => (i.sold || 0) > 0).length})`}
                  color={filter === 'sold' ? 'primary' : 'default'}
                  onClick={() => setFilter('sold')}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
                <Chip
                  label={`Returned (${items.filter(i => (i.returned || 0) > 0).length})`}
                  color={filter === 'returned' ? 'primary' : 'default'}
                  onClick={() => setFilter('returned')}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
                <Chip
                  label={`In stock (${items.filter(i => (i.stock || 0) > 0).length})`}
                  color={filter === 'inStock' ? 'primary' : 'default'}
                  onClick={() => setFilter('inStock')}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              </Box>
            </Box>

            {filteredItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No items match the selected filter
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {filteredItems.map((item) => (
                  <Accordion key={item._id}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ minHeight: '48px', '& .MuiAccordionSummary-content': { my: 1 } }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {item.category?.name || item.category || 'No folder'}
                          </Typography>
                        </Box>
                        {item.price && (
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', minWidth: 60, textAlign: 'right' }}>
                            ₹{item.price?.toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 1, pb: 2 }}>
                      <Box>
                        <Grid container spacing={1.5}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              Total stock
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {item.totalStock || 0}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              Sold
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                              {item.sold || 0}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              Returned
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                              {item.returned || 0}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              In stock
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                              {item.stock || 0}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </Paper>
        </>
      )}

      {!results && !searching && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SearchIconMui sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Select a date range and click search to view results
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            You can filter results by sold, returned, or items in stock
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

