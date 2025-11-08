import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  TextField,
  Pagination,
  Card,
  CardContent,
  Skeleton,
  MenuItem,
} from '@mui/material'
import { 
  Search as SearchIcon,
  AssignmentReturn as ReturnIcon,
} from '@mui/icons-material'
import { returnAPI, categoryAPI } from '../services/api'

export default function Returns() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    fetchReturns()
    fetchCategories()
  }, [searchTerm])

  const fetchCategories = async () => {
    try {
      const { data } = await categoryAPI.getAll()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchReturns = async () => {
    try {
      setLoading(true)
      // Fetch products with returns from the dedicated endpoint
      const { data } = await returnAPI.getProducts({
        keyword: searchTerm,
        page,
        limit: 100 // Get more items for client-side pagination
      })

      const returnedItems = data.products || data || []
      setItems(returnedItems)
    } catch (error) {
      console.error('Error fetching returns:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  // Filter items by category first for stats
  const categoryFilteredItems = categoryFilter === 'all' 
    ? items 
    : items.filter(item => (item.category?._id || item.category) === categoryFilter)

  // Calculate stats from category-filtered items
  const stats = {
    totalReturns: categoryFilteredItems.reduce((sum, item) => sum + (item.returned || 0), 0),
    totalValue: categoryFilteredItems.reduce((sum, item) => sum + ((item.returned || 0) * (item.price || 0)), 0),
  }

  // Filter items by search and category for display
  const filteredItems = items.filter(item => {
    // Search filter
    const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category?.name || item.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || 
      (item.category?._id || item.category) === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const paginatedItems = filteredItems.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  const selectedCategory = categories.find(cat => cat._id === categoryFilter)

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
          Returned Boxes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {categoryFilter === 'all' ? 'All folders' : selectedCategory?.name || 'Selected Folder'}
        </Typography>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Total returns
              </Typography>
              {loading ? (
                <Skeleton variant="text" width={60} height={40} />
              ) : (
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main', mt: 0.5 }}>
                  {stats.totalReturns}
                </Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Total value
              </Typography>
              {loading ? (
                <Skeleton variant="text" width={80} height={40} />
              ) : (
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main', mt: 0.5 }}>
                  ₹{stats.totalValue.toFixed(2)}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search returned boxes by name or folder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
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
        </Grid>

        {/* Items Count */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredItems.length} {categoryFilter !== 'all' ? `of ${items.length}` : ''} {filteredItems.length === 1 ? 'box' : 'boxes'}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ px: 1.5, py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1.5 }} />
                      <Skeleton variant="text" width="60%" height={24} />
                    </Box>
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="80%" height={20} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : paginatedItems.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No returned boxes found
                </Typography>
              </Box>
            </Grid>
          ) : (
            paginatedItems.map((item, index) => {
              const gradients = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
              ]
              const borderColors = [
                '#667eea',
                '#f093fb',
                '#fa709a',
                '#ff9a9e',
                '#ffecd2',
                '#ff6e7f',
              ]
              return (
                <Grid item xs={12} sm={6} md={4} key={item._id || item.id}>
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
                          <ReturnIcon sx={{ color: 'white', fontSize: 18 }} />
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
                            {item.category?.name || item.category}
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
                                Price
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'primary.main' }}>
                                ₹{(item.price || 0).toFixed(2)}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                Value
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'error.main' }}>
                                ₹{((item.returned || 0) * (item.price || 0)).toFixed(2)}
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

        {!loading && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Paper>
    </Box>
  )
}

