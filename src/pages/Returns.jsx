import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  TextField,
  Pagination,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Search as SearchIcon } from '@mui/icons-material'
import { returnAPI } from '../services/api'
import { AccordionSkeleton } from '../components/Loading'

export default function Returns() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    fetchReturns()
  }, [searchTerm])

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

  // Calculate stats from items
  const stats = {
    totalReturns: items.reduce((sum, item) => sum + (item.returned || 0), 0),
    totalValue: items.reduce((sum, item) => sum + ((item.returned || 0) * (item.price || 0)), 0),
  }

  const filteredItems = items.filter(item =>
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category?.name || item.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const paginatedItems = filteredItems.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  return (
    <Box>
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

      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search returned items by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
        />

        {loading ? (
          <AccordionSkeleton count={6} />
        ) : paginatedItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No returned items found
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {paginatedItems.map((item) => (
                <Accordion key={item._id || item.id}>
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
                          {item.category?.name || item.category}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main', minWidth: 60, textAlign: 'right' }}>
                        ₹{((item.returned || 0) * (item.price || 0)).toFixed(2)}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 1, pb: 2 }}>
                    <Box>
                      <Grid container spacing={1.5}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            Total stock
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {item.totalStock || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            Returned
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                            {item.returned || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            Unit price
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            ₹{(item.price || 0).toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            Total value
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                            ₹{((item.returned || 0) * (item.price || 0)).toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            {!loading && totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  )
}

