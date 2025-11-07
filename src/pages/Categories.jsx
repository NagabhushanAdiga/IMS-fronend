import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  DialogContentText,
  Skeleton,
  InputAdornment,
  Paper,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { categoryAPI, productAPI } from '../services/api'
import CustomSnackbar from '../components/Snackbar'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  // Product dialog states
  const [openProductDialog, setOpenProductDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [productFormData, setProductFormData] = useState({
    name: '',
    category: '',
    totalStock: '',
    sold: '0',
    returned: '0',
    price: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data } = await categoryAPI.getAll()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ name: category.name, description: category.description })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', description: '' })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, formData)
      } else {
        await categoryAPI.create(formData)
      }
      handleCloseDialog()
      fetchCategories()
      setSnackbar({
        open: true,
        message: editingCategory ? 'Category updated successfully!' : 'Category added successfully!',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error saving category:', error)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving category',
        severity: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        setDeleting(true)
        await categoryAPI.delete(categoryToDelete._id)
        fetchCategories()
        setSnackbar({
          open: true,
          message: 'Category deleted successfully!',
          severity: 'success'
        })
      } catch (error) {
        console.error('Error deleting category:', error)
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error deleting category',
          severity: 'error'
        })
      } finally {
        setDeleting(false)
      }
    }
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  // Product dialog handlers
  const handleCardClick = (category) => {
    setSelectedCategory(category)
    setProductFormData({
      name: '',
      category: category._id,
      totalStock: '',
      sold: '0',
      returned: '0',
      price: '',
    })
    setOpenProductDialog(true)
  }

  const handleCloseProductDialog = () => {
    setOpenProductDialog(false)
    setSelectedCategory(null)
    setProductFormData({
      name: '',
      category: '',
      totalStock: '',
      sold: '0',
      returned: '0',
      price: '',
    })
  }

  const handleSaveProduct = async () => {
    // Validation
    if (!productFormData.name?.trim()) {
      setSnackbar({ open: true, message: 'Item name is required', severity: 'error' })
      return
    }
    if (!productFormData.totalStock || parseInt(productFormData.totalStock) < 0) {
      setSnackbar({ open: true, message: 'Valid total stock is required', severity: 'error' })
      return
    }

    setSaving(true)
    try {
      const productData = {
        name: productFormData.name.trim(),
        sku: productFormData.name.trim(), // Use item name as SKU
        category: productFormData.category,
        totalStock: parseInt(productFormData.totalStock),
        sold: parseInt(productFormData.sold || 0),
        returned: parseInt(productFormData.returned || 0),
        price: parseFloat(productFormData.price || 0)
      }

      await productAPI.create(productData)
      handleCloseProductDialog()
      fetchCategories() // Refresh to update product count
      setSnackbar({
        open: true,
        message: 'Item added successfully!',
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

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Add category</Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Add</Box>
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search categories by name or description..."
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
      </Paper>

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
        ) : filteredCategories.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No categories found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {searchTerm ? 'Try adjusting your search terms' : 'Add a category to get started'}
              </Typography>
            </Box>
          </Grid>
        ) : (
          filteredCategories.map((category, index) => {
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
              <Grid item xs={12} sm={6} md={4} key={category._id || category.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderTop: `15px solid ${borderColors[index % borderColors.length]}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    }
                  }}
                  onClick={() => handleCardClick(category)}
                >
                  <CardContent sx={{ flexGrow: 1, py: 2, px: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Box
                        sx={{
                          background: gradients[index % gradients.length],
                          borderRadius: 1.5,
                          p: 0.75,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CategoryIcon sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                        {category.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                      {category.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                          {category.productCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Items
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDialog(category)
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(category)
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit category' : 'Add new category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Category name"
              fullWidth
              required
              size="small"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              size="small"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : (editingCategory ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

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
          <DialogContentText>
            Are you sure you want to delete category "{categoryToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={openProductDialog} onClose={handleCloseProductDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add item to "{selectedCategory?.name}"
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Item name"
              fullWidth
              required
              size="small"
              value={productFormData.name}
              onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
              autoFocus
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
            <TextField
              label="Category"
              fullWidth
              size="small"
              value={selectedCategory?.name || ''}
              InputProps={{ readOnly: true }}
              disabled
              helperText="Category is pre-selected"
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
            <TextField
              label="Total stock"
              fullWidth
              required
              type="number"
              size="small"
              value={productFormData.totalStock}
              onChange={(e) => setProductFormData({ ...productFormData, totalStock: e.target.value })}
              helperText="Initial total quantity added to inventory"
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
            <TextField
              label="Items sold"
              fullWidth
              type="number"
              size="small"
              value={productFormData.sold}
              onChange={(e) => setProductFormData({ ...productFormData, sold: e.target.value })}
              helperText="Number of items sold (optional)"
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
            <TextField
              label="Items returned"
              fullWidth
              type="number"
              size="small"
              value={productFormData.returned}
              onChange={(e) => setProductFormData({ ...productFormData, returned: e.target.value })}
              helperText="Number of items returned by customers (optional)"
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
            <TextField
              label="Price"
              fullWidth
              type="number"
              size="small"
              inputProps={{ step: '0.01' }}
              value={productFormData.price}
              onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
              helperText="Price per unit (optional)"
              InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDialog} disabled={saving}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained" disabled={saving}>
            {saving ? 'Adding...' : 'Add item'}
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
