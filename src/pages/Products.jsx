import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  InputAdornment,
  Pagination,
  DialogContentText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { productAPI, categoryAPI } from '../services/api'
import { AccordionSkeleton } from '../components/Loading'
import CustomSnackbar from '../components/Snackbar'

const getStatusColor = (status) => {
  const colors = {
    'In Stock': 'success',
    'Low Stock': 'warning',
    'Out of Stock': 'error',
  }
  return colors[status] || 'default'
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const itemsPerPage = 6
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    totalStock: '',
    sold: '0',
    returned: '0',
    stock: '',
    price: '',
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [searchTerm])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data } = await productAPI.getAll({ keyword: searchTerm })
      setProducts(data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await categoryAPI.getAll()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product)
      // Properly extract values from product for editing
      setFormData({
        name: product.name || '',
        category: product.category?._id || product.category || '',
        totalStock: product.totalStock?.toString() || '',
        sold: product.sold?.toString() || '0',
        returned: product.returned?.toString() || '0',
        stock: '',
        price: product.price?.toString() || ''
      })
    } else {
      setEditingProduct(null)
      setFormData({ name: '', category: '', totalStock: '', sold: '0', returned: '0', stock: '', price: '' })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingProduct(null)
    setFormData({ name: '', category: '', totalStock: '', sold: '0', returned: '0', stock: '', price: '' })
  }

  const handleSave = async () => {
    // Validation
    if (!formData.name?.trim()) {
      setSnackbar({ open: true, message: 'Item name is required', severity: 'error' })
      return
    }
    if (!formData.category) {
      setSnackbar({ open: true, message: 'Category is required', severity: 'error' })
      return
    }
    if (!formData.totalStock || parseInt(formData.totalStock) < 0) {
      setSnackbar({ open: true, message: 'Valid total stock is required', severity: 'error' })
      return
    }

    setSaving(true)
    try {
      const productData = {
        name: formData.name.trim(),
        sku: formData.name.trim(), // Use item name as SKU
        category: formData.category,
        totalStock: parseInt(formData.totalStock),
        sold: parseInt(formData.sold || 0),
        returned: parseInt(formData.returned || 0),
        price: parseFloat(formData.price || 0)
      }

      if (editingProduct) {
        await productAPI.update(editingProduct._id, productData)
      } else {
        await productAPI.create(productData)
      }

      handleCloseDialog()
      fetchProducts()
      setSnackbar({
        open: true,
        message: editingProduct ? 'Item updated successfully!' : 'Item added successfully!',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error saving product:', error)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving item',
        severity: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteClick = (product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      setDeleting(true)
      try {
        await productAPI.delete(productToDelete._id)
        fetchProducts()
        setSnackbar({
          open: true,
          message: 'Item deleted successfully!',
          severity: 'success'
        })
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error deleting item',
          severity: 'error'
        })
      } finally {
        setDeleting(false)
      }
    }
    setDeleteDialogOpen(false)
    setProductToDelete(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setProductToDelete(null)
  }

  const totalPages = Math.ceil(products.length / itemsPerPage)
  const paginatedProducts = products.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
          onClick={() => handleOpenDialog()}
          size="small"
          sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Add item</Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Add</Box>
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search items by name or category..."
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
            {paginatedProducts.map((product) => (
              <Accordion key={product._id}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ minHeight: '48px', '& .MuiAccordionSummary-content': { my: 1 } }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {product.name}
                      </Typography>
                    </Box>
                    {product.price && (
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', minWidth: 60, textAlign: 'right' }}>
                        ₹{product.price?.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 1, pb: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Category: {product.category?.name || product.category}
                      </Typography>
                      <Chip
                        label={product.status}
                        color={getStatusColor(product.status)}
                        size="small"
                      />
                    </Box>

                    <Grid container spacing={1.5} sx={{ mb: 2 }}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Total stock
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {product.totalStock}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Sold
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                          {product.sold}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Returned
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                          {product.returned}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Remaining
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          {product.stock}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(product)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {totalPages > 1 && (
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
        <DialogTitle>
          {editingProduct ? 'Edit item' : 'Add new item'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Item name"
              fullWidth
              required
              size="small"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
            <TextField
              label="Category"
              fullWidth
              required
              select
              size="small"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Total stock"
              fullWidth
              required
              type="number"
              size="small"
              value={formData.totalStock}
              onChange={(e) => setFormData({ ...formData, totalStock: e.target.value })}
              helperText="Initial total quantity added to inventory"
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
            <TextField
              label="Items sold"
              fullWidth
              type="number"
              size="small"
              value={formData.sold}
              onChange={(e) => setFormData({ ...formData, sold: e.target.value })}
              helperText="Number of items sold (optional)"
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
            <TextField
              label="Items returned"
              fullWidth
              type="number"
              size="small"
              value={formData.returned}
              onChange={(e) => setFormData({ ...formData, returned: e.target.value })}
              helperText="Number of items returned by customers (optional)"
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
            <TextField
              label="Price"
              fullWidth
              type="number"
              size="small"
              inputProps={{ step: '0.01' }}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              helperText="Price per unit (optional)"
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : editingProduct ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
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
