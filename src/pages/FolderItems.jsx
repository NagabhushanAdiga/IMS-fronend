import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Breadcrumbs,
  Link,
  Skeleton,
  InputAdornment,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Folder as FolderIcon,
  Inventory as InventoryIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { productAPI, categoryAPI } from '../services/api'
import CustomSnackbar from '../components/Snackbar'

const getStatusColor = (status) => {
  const colors = {
    'In Stock': 'success',
    'Low Stock': 'warning',
    'Out of Stock': 'error',
  }
  return colors[status] || 'default'
}

export default function FolderItems() {
  const { folderId } = useParams()
  const navigate = useNavigate()
  const [folder, setFolder] = useState(null)
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'inStock', 'lowStock', 'outOfStock', 'sold', 'returned'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    totalStock: '',
    sold: '0',
    returned: '0',
    price: '',
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchFolder()
    fetchItems()
    fetchCategories()
  }, [folderId])

  const fetchFolder = async () => {
    try {
      const { data } = await categoryAPI.getOne(folderId)
      setFolder(data)
    } catch (error) {
      console.error('Error fetching folder:', error)
    }
  }

  const fetchItems = async () => {
    try {
      setLoading(true)
      const { data } = await productAPI.getAll()
      const allItems = data.products || []
      // Filter items by this folder/category
      const folderItems = allItems.filter(item =>
        (item.category?._id || item.category) === folderId
      )
      setItems(folderItems)
    } catch (error) {
      console.error('Error fetching items:', error)
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
      setFormData({
        name: product.name || '',
        category: product.category?._id || product.category || folderId,
        totalStock: product.totalStock?.toString() || '',
        sold: product.sold?.toString() || '0',
        returned: product.returned?.toString() || '0',
        price: product.price?.toString() || ''
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        category: folderId, // Pre-select current folder
        totalStock: '',
        sold: '0',
        returned: '0',
        price: ''
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingProduct(null)
    setFormData({ name: '', category: folderId, totalStock: '', sold: '0', returned: '0', price: '' })
  }

  const handleSave = async () => {
    // Validation
    if (!formData.name?.trim()) {
      setSnackbar({ open: true, message: 'Box name is required', severity: 'error' })
      return
    }
    if (!formData.category) {
      setSnackbar({ open: true, message: 'Folder is required', severity: 'error' })
      return
    }
    if (!formData.totalStock || parseInt(formData.totalStock) < 0) {
      setSnackbar({ open: true, message: 'Valid total stock is required', severity: 'error' })
      return
    }

    setSaving(true)
    try {
      const itemName = formData.name?.trim() || 'box'
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 7)

      const uniqueSku = editingProduct
        ? (editingProduct.sku || `${itemName}-${timestamp}-${randomSuffix}`)
        : `${itemName}-${timestamp}-${randomSuffix}`

      const productData = {
        name: itemName,
        sku: uniqueSku,
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
      fetchItems()
      setSnackbar({
        open: true,
        message: editingProduct ? 'Box updated successfully!' : 'Box added successfully!',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error saving product:', error)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving box',
        severity: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      setDeleting(true)
      try {
        await productAPI.delete(productToDelete._id)
        fetchItems()
        setSnackbar({
          open: true,
          message: 'Box deleted successfully!',
          severity: 'success'
        })
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error deleting box',
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

  // Filter and search items
  const getFilteredItems = () => {
    let filtered = items

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    switch (filter) {
      case 'inStock':
        return filtered.filter(item => item.status === 'In Stock')
      case 'lowStock':
        return filtered.filter(item => item.status === 'Low Stock')
      case 'outOfStock':
        return filtered.filter(item => item.status === 'Out of Stock')
      case 'sold':
        return filtered.filter(item => (item.sold || 0) > 0)
      case 'returned':
        return filtered.filter(item => (item.returned || 0) > 0)
      default:
        return filtered
    }
  }

  const filteredItems = getFilteredItems()

  return (
    <Box>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/folder')}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <FolderIcon fontSize="small" />
            Folders
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 'bold' }}>
            {folder?.name || 'Loading...'}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {folder?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {folder?.description}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => navigate('/folder')}
            size="small"
            sx={{ display: { xs: 'flex', sm: 'none' } }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
            onClick={() => handleOpenDialog()}
            size="small"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Add box</Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Add</Box>
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search boxes by name..."
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
              label="Filter by"
              select
              fullWidth
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            >
              <MenuItem value="all">All boxes</MenuItem>
              <MenuItem value="inStock">In stock</MenuItem>
              <MenuItem value="lowStock">Low stock</MenuItem>
              <MenuItem value="outOfStock">Out of stock</MenuItem>
              <MenuItem value="sold">Sold</MenuItem>
              <MenuItem value="returned">Returned</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Count and Filter Chips */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredItems.length} of {items.length} {items.length === 1 ? 'box' : 'boxes'}
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
            label={`In stock (${items.filter(i => i.status === 'In Stock').length})`}
            color={filter === 'inStock' ? 'primary' : 'default'}
            onClick={() => setFilter('inStock')}
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
        </Box>
      </Box>

      <Grid container spacing={3}>
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1.5 }} />
                    <Skeleton variant="text" width="60%" height={28} />
                  </Box>
                  <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Skeleton variant="text" width={40} height={36} />
                      <Skeleton variant="text" width={60} height={16} />
                    </Box>
                    <Box>
                      <Skeleton variant="circular" width={32} height={32} sx={{ display: 'inline-block', mr: 0.5 }} />
                      <Skeleton variant="circular" width={32} height={32} sx={{ display: 'inline-block' }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : filteredItems.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                {items.length === 0 ? 'No boxes in this folder' : 'No boxes match your filters'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {items.length === 0 ? 'Click "Add box" to add your first box' : 'Try adjusting your search or filters'}
              </Typography>
            </Paper>
          </Grid>
        ) : (
          filteredItems.map((product, index) => {
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
              <Grid item xs={12} sm={6} md={4} key={product._id}>
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
                      '& .action-buttons': {
                        opacity: 1,
                      }
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    {/* Header with Icon and Name */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
                          {product.name}
                        </Typography>
                      </Box>
                      <Chip
                        label={product.status}
                        color={getStatusColor(product.status)}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                      />
                    </Box>

                    {/* Stats Grid with Background */}
                    <Box
                      sx={{
                        bgcolor: 'rgba(0,0,0,0.02)',
                        borderRadius: 1,
                        p: 1,
                        mb: 1
                      }}
                    >
                      <Grid container spacing={0.5}>
                        <Grid item xs={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600 }}>
                              Total
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'text.primary' }}>
                              {product.totalStock || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600 }}>
                              Sold
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'error.main' }}>
                              {product.sold || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600 }}>
                              Return
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'warning.main' }}>
                              {product.returned || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 600 }}>
                              Stock
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'success.main' }}>
                              {product.stock || 0}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Action Buttons */}
                    <Box
                      className="action-buttons"
                      sx={{
                        display: 'flex',
                        gap: 0.75,
                        opacity: 0.7,
                        transition: 'opacity 0.3s ease'
                      }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                        onClick={() => handleOpenDialog(product)}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.7rem',
                          py: 0.3,
                          minHeight: 0
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        fullWidth
                        startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                        onClick={() => handleDeleteClick(product)}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.7rem',
                          py: 0.3,
                          minHeight: 0
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })
        )}
      </Grid>

      {/* Add/Edit Item Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit box' : 'Add new box'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Box name"
              fullWidth
              required
              size="small"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
            <TextField
              label="Folder"
              fullWidth
              size="small"
              value={folder?.name || 'Loading...'}
              InputProps={{ readOnly: true }}
              disabled
              helperText="Boxes will be added to this folder"
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
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
              label="Boxes sold"
              fullWidth
              type="number"
              size="small"
              value={formData.sold}
              onChange={(e) => setFormData({ ...formData, sold: e.target.value })}
              helperText="Number of boxes sold (optional)"
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
            <TextField
              label="Boxes returned"
              fullWidth
              type="number"
              size="small"
              value={formData.returned}
              onChange={(e) => setFormData({ ...formData, returned: e.target.value })}
              helperText="Number of boxes returned by customers (optional)"
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

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderTop: '10px solid #f44336'
          }
        }}
      >
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
          </Typography>
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

