import { useState, useEffect } from 'react'
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
  MenuItem,
} from '@mui/material'
import {
  ShoppingCart,
  AssignmentReturn,
  Inventory,
  Search as SearchIconMui,
  Inventory as InventoryIcon,
} from '@mui/icons-material'
import { productAPI, categoryAPI } from '../services/api'
import CustomSnackbar from '../components/Snackbar'

export default function Search() {
  // Get current month's start and end dates
  const getCurrentMonthDates = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    return {
      start: formatDate(firstDay),
      end: formatDate(lastDay)
    }
  }

  const defaultDates = getCurrentMonthDates()

  const [startDate, setStartDate] = useState(defaultDates.start)
  const [endDate, setEndDate] = useState(defaultDates.end)
  const [filter, setFilter] = useState('all') // 'all', 'sold', 'returned', 'inStock'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [categories, setCategories] = useState([])
  const [results, setResults] = useState(null)
  const [items, setItems] = useState([])
  const [searching, setSearching] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data } = await categoryAPI.getAll()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

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
        message: `Found ${allItems.length} boxes in the selected date range`,
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
    const defaultDates = getCurrentMonthDates()
    setStartDate(defaultDates.start)
    setEndDate(defaultDates.end)
    setFilter('all')
    setCategoryFilter('all')
    setResults(null)
    setItems([])
  }

  // Filter boxes based on selected filter and category
  const getFilteredItems = () => {
    if (!items.length) return []

    let filtered = items

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item =>
        (item.category?._id || item.category) === categoryFilter
      )
    }

    // Apply status filter
    switch (filter) {
      case 'sold':
        return filtered.filter(item => (item.sold || 0) > 0)
      case 'returned':
        return filtered.filter(item => (item.returned || 0) > 0)
      case 'inStock':
        return filtered.filter(item => (item.stock || 0) > 0)
      default:
        return filtered
    }
  }

  const filteredItems = getFilteredItems()

  // Calculate filtered stats based on category filter
  const getFilteredStats = () => {
    let itemsToCalculate = items

    // Apply category filter if selected
    if (categoryFilter !== 'all') {
      itemsToCalculate = itemsToCalculate.filter(item =>
        (item.category?._id || item.category) === categoryFilter
      )
    }

    return {
      totalItems: itemsToCalculate.length,
      soldItems: itemsToCalculate.filter(i => (i.sold || 0) > 0).length,
      returnedItems: itemsToCalculate.filter(i => (i.returned || 0) > 0).length,
      soldCount: itemsToCalculate.reduce((sum, item) => sum + (item.sold || 0), 0),
      returnedCount: itemsToCalculate.reduce((sum, item) => sum + (item.returned || 0), 0),
      soldValue: itemsToCalculate.reduce((sum, item) => sum + ((item.sold || 0) * (item.price || 0)), 0),
      returnedValue: itemsToCalculate.reduce((sum, item) => sum + ((item.returned || 0) * (item.price || 0)), 0),
    }
  }

  const filteredStats = getFilteredStats()
  const selectedCategory = categories.find(cat => cat._id === categoryFilter)

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
          <Grid item xs={12} md={2}>
            <TextField
              label="Filter by status"
              select
              fullWidth
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            >
              <MenuItem value="all">All boxes</MenuItem>
              <MenuItem value="sold">Sold boxes</MenuItem>
              <MenuItem value="returned">Returned boxes</MenuItem>
              <MenuItem value="inStock">Boxes in stock</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Filter by folder"
              select
              fullWidth
              size="small"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            >
              <MenuItem value="all">All folders</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
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
                title="Boxes sold"
                value={results.itemsSold}
                subtitle={`Total value: ₹${results.soldValue.toFixed(2)}`}
                icon={<ShoppingCart sx={{ color: 'white', fontSize: 32 }} />}
                gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Boxes returned"
                value={results.itemsReturned}
                subtitle={`Total value: ₹${results.returnedValue.toFixed(2)}`}
                icon={<AssignmentReturn sx={{ color: 'white', fontSize: 32 }} />}
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Boxes in stock"
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
                    {results.itemsSold - results.itemsReturned} boxes
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    ₹{(results.soldValue - results.returnedValue).toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                {/* Folder Summary */}
                <Paper sx={{ p: 2, bgcolor: categoryFilter === 'all' ? 'rgba(102, 126, 234, 0.05)' : 'rgba(102, 126, 234, 0.05)', border: `2px solid ${categoryFilter === 'all' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.2)'}` }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, mb: 1.5, display: 'block' }}>
                    {categoryFilter === 'all' ? 'All Boxes Summary' : `${selectedCategory?.name || 'Selected Folder'} Summary`}
                  </Typography>
                  <Grid container spacing={0.5}>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center', p: 0.75, bgcolor: 'white', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600 }}>
                          Total
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1rem' }}>
                          {filteredStats.totalItems}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center', p: 0.75, bgcolor: 'white', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600 }}>
                          Sold
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main', fontSize: '1rem' }}>
                          {filteredStats.soldCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                          ₹{filteredStats.soldValue.toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center', p: 0.75, bgcolor: 'white', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600 }}>
                          Return
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main', fontSize: '1rem' }}>
                          {filteredStats.returnedCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                          ₹{filteredStats.returnedValue.toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center', p: 0.75, bgcolor: 'white', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600 }}>
                          Net
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '1rem' }}>
                          ₹{(filteredStats.soldValue - filteredStats.returnedValue).toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Items List */}
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Boxes ({filteredItems.length})
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

            <Grid container spacing={2}>
              {filteredItems.length === 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No boxes match the selected filter
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                filteredItems.map((item, index) => {
                  const gradients = [
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
                    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                  ]
                  const borderColors = [
                    '#667eea',
                    '#11998e',
                    '#3a7bd5',
                    '#f093fb',
                    '#fa709a',
                    '#30cfd0',
                  ]
                  return (
                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderTop: `4px solid ${borderColors[index % borderColors.length]}`,
                          position: 'relative',
                          overflow: 'visible',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                          }
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, py: 1.5, px: 1.5, '&:last-child': { pb: 1.5 } }}>
                          {/* Header with Icon and Name */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                            <Box
                              sx={{
                                background: gradients[index % gradients.length],
                                borderRadius: 1.5,
                                p: 0.6,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              }}
                            >
                              <InventoryIcon sx={{ color: 'white', fontSize: 18 }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                component="div"
                                sx={{
                                  fontWeight: 'bold',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontSize: '0.9rem'
                                }}
                              >
                                {item.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: '0.7rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block'
                                }}
                              >
                                {item.category?.name || item.category || 'No folder'}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Stats Grid with Background */}
                          <Box
                            sx={{
                              bgcolor: 'rgba(0,0,0,0.02)',
                              borderRadius: 1,
                              p: 0.75,
                              mb: 0
                            }}
                          >
                            <Grid container spacing={0.5}>
                              <Grid item xs={3}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                    Total
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'text.primary' }}>
                                    {item.totalStock || 0}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={3}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                    Sold
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'error.main' }}>
                                    {item.sold || 0}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={3}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                    Return
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'warning.main' }}>
                                    {item.returned || 0}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={3}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                    Stock
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'success.main' }}>
                                    {item.stock || 0}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })
              )}
            </Grid>
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
            You can filter results by sold, returned, or boxes in stock
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

