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
  const [statsLoading, setStatsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState({ totalReturns: 0, totalValue: 0 })
  const itemsPerPage = 6

  useEffect(() => {
    fetchReturns()
    fetchStats()
  }, [searchTerm])

  const fetchReturns = async () => {
    try {
      setLoading(true)
      const { data } = await returnAPI.getAll({ keyword: searchTerm })
      setItems(data.returns || data)
    } catch (error) {
      console.error('Error fetching returns:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const { data } = await returnAPI.getStats()
      setStats({
        totalReturns: data.totalReturns || 0,
        totalValue: data.totalValue || 0,
      })
    } catch (error) {
      console.error('Error fetching return stats:', error)
      // Calculate from items if backend doesn't provide stats
      const totalReturned = items.reduce((sum, item) => sum + (item.quantity || item.returned || 0), 0)
      const totalValue = items.reduce((sum, item) => sum + (item.totalValue || 0), 0)
      setStats({ totalReturns: totalReturned, totalValue })
    } finally {
      setStatsLoading(false)
    }
  }

  const filteredItems = items.filter(item =>
    (item.productName || item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.productSku || item.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
          Returns
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Returns
              </Typography>
              {statsLoading ? (
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
                Total Value
              </Typography>
              {statsLoading ? (
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
          placeholder="Search returns by name, SKU, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
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
                          {item.productName || item.product?.name || item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {item.productSku || item.product?.sku || item.sku}
                        </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main', minWidth: 60, textAlign: 'right' }}>
                    ₹{(item.totalValue || (item.quantity * item.price) || 0).toFixed(2)}
                  </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 1, pb: 2 }}>
                    <Box>
                      <Grid container spacing={1.5}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            Category
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {item.category?.name || item.category || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            Return Date
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {item.returnDate ? new Date(item.returnDate).toLocaleDateString() : item.date || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            Unit Price
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            ₹{(item.price || 0).toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            Quantity
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                            {item.quantity || item.returned || 0}
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

