import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Pagination,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { saleAPI } from '../services/api'
import { AccordionSkeleton } from '../components/Loading'
import CustomSnackbar from '../components/Snackbar'

const statusOptions = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled']

const getStatusColor = (status) => {
  const colors = {
    Completed: 'success',
    Processing: 'info',
    Shipped: 'primary',
    Pending: 'warning',
    Cancelled: 'error',
  }
  return colors[status] || 'default'
}

export default function Sales() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const itemsPerPage = 6
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchSales()
  }, [searchTerm])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const { data } = await saleAPI.getAll({ keyword: searchTerm })
      setOrders(data.sales || data)
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedOrder(null)
  }

  const handleStatusChange = async (newStatus) => {
    if (selectedOrder) {
      try {
        setSaving(true)
        await saleAPI.update(selectedOrder._id, { status: newStatus })
        setOrders(orders.map(o =>
          o._id === selectedOrder._id ? { ...o, status: newStatus } : o
        ))
        setSelectedOrder({ ...selectedOrder, status: newStatus })
        setSnackbar({
          open: true,
          message: 'Sale status updated successfully!',
          severity: 'success'
        })
      } catch (error) {
        console.error('Error updating sale status:', error)
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error updating sale status',
          severity: 'error'
        })
      } finally {
        setSaving(false)
      }
    }
  }

  const filteredOrders = orders.filter(order =>
    (order.saleId || order._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customerName || order.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customerEmail || order.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search sales by ID, customer, or email..."
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
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {paginatedOrders.map((order) => (
              <Accordion key={order._id || order.id}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ minHeight: '48px', '& .MuiAccordionSummary-content': { my: 1 } }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {order.saleId || order.id || `SALE-${order._id?.slice(-6)}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {order.customerName || order.customer}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', minWidth: 70, textAlign: 'right' }}>
                    ₹{(order.totalAmount || order.total || 0).toFixed(2)}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 1, pb: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {order.customerEmail || order.email}
                    </Typography>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </Box>

                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Number of items
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {order.items?.length || order.items || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Sale date
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {order.saleDate ? new Date(order.saleDate).toLocaleDateString() : order.date || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewOrder(order)}
                    >
                      View details
                    </Button>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
          </Box>
        )}

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
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Sale details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Sale ID"
                value={selectedOrder.saleId || selectedOrder.id || `SALE-${selectedOrder._id?.slice(-6)}`}
                InputProps={{ readOnly: true }}
                size="small"
                fullWidth
                InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
              />
              <TextField
                label="Customer name"
                value={selectedOrder.customerName || selectedOrder.customer}
                InputProps={{ readOnly: true }}
                size="small"
                fullWidth
                InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
              />
              <TextField
                label="Email"
                value={selectedOrder.customerEmail || selectedOrder.email}
                InputProps={{ readOnly: true }}
                size="small"
                fullWidth
                InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
              />
              <TextField
                label="Number of items"
                value={selectedOrder.items?.length || selectedOrder.items || 0}
                InputProps={{ readOnly: true }}
                size="small"
                fullWidth
                InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
              />
              <TextField
                label="Total amount"
                value={`₹${(selectedOrder.totalAmount || selectedOrder.total || 0).toFixed(2)}`}
                InputProps={{ readOnly: true }}
                size="small"
                fullWidth
                InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
              />
              <TextField
                label="Sale date"
                value={selectedOrder.saleDate ? new Date(selectedOrder.saleDate).toLocaleDateString() : selectedOrder.date || 'N/A'}
                InputProps={{ readOnly: true }}
                size="small"
                fullWidth
                InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
              />
              <TextField
                label="Status"
                select
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={saving}
                size="small"
                fullWidth
                InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>Close</Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  )
}

