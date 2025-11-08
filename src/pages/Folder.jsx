import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function Folder() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [formData, setFormData] = useState({
    name: '',
    description: 'Configure folder',
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
      setFormData({ name: '', description: 'Configure folders' })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingCategory(null)
    setFormData({ name: '', description: 'Configure folders' })
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
        message: editingCategory ? 'Folder updated successfully!' : 'Folder added successfully!',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error saving category:', error)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving folder',
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
          message: 'Folder deleted successfully!',
          severity: 'success'
        })
      } catch (error) {
        console.error('Error deleting category:', error)
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error deleting folder',
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

  // Navigate to folder items page
  const handleCardClick = (category) => {
    navigate(`/folder/${category._id}`)
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
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Add folder</Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Add</Box>
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search folders by name or description..."
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
                No folders found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {searchTerm ? 'Try adjusting your search terms' : 'Add a folder to get started'}
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
                    borderRadius: 3,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'visible',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    // Hover effects only on desktop (md and up)
                    '@media (hover: hover)': {
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: `0 20px 40px ${borderColors[index % borderColors.length]}30`,
                        border: `1px solid ${borderColors[index % borderColors.length]}40`,
                        '& .action-buttons': {
                          opacity: 1,
                          transform: 'translateY(0)',
                        },
                        '& .category-icon': {
                          transform: 'scale(1.15) rotate(-5deg)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                        },
                        '& .gradient-overlay': {
                          opacity: 0.08,
                        },
                        '& .count-badge': {
                          transform: 'scale(1.1)',
                        }
                      },
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '100%',
                      background: gradients[index % gradients.length],
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                      borderRadius: 3,
                      zIndex: 0,
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '6px',
                      background: gradients[index % gradients.length],
                      borderRadius: '12px 12px 0 0',
                    }
                  }}
                  onClick={() => handleCardClick(category)}
                >
                  {/* Gradient Overlay */}
                  <Box 
                    className="gradient-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: gradients[index % gradients.length],
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                      zIndex: 0,
                      borderRadius: 3,
                    }}
                  />

                  <CardContent sx={{ position: 'relative', zIndex: 1, flexGrow: 1, py: { xs: 2, md: 3 }, px: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                    {/* Decorative Circle */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -30,
                        right: -30,
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: gradients[index % gradients.length],
                        opacity: 0.05,
                        zIndex: 0,
                      }}
                    />

                    {/* Header with Icon and Name */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, position: 'relative', zIndex: 1 }}>
                      <Box
                        className="category-icon"
                        sx={{
                          background: gradients[index % gradients.length],
                          borderRadius: 2.5,
                          p: { xs: 1.25, md: 1.5 },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 8px 16px ${borderColors[index % borderColors.length]}40`,
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          minWidth: { xs: 48, md: 56 },
                          height: { xs: 48, md: 56 },
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            inset: -3,
                            borderRadius: 2.5,
                            background: gradients[index % gradients.length],
                            opacity: 0.2,
                            zIndex: -1,
                          }
                        }}
                      >
                        <CategoryIcon sx={{ color: 'white', fontSize: { xs: 24, md: 28 } }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="h6" 
                          component="div" 
                          sx={{ 
                            fontWeight: 'bold',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '1.25rem',
                            color: 'text.primary'
                          }}
                        >
                          {category.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: '0.8rem',
                            lineHeight: 1.5,
                            opacity: 0.8
                          }}
                        >
                          {category.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Stats Section with Badge */}
                    <Box 
                      className="count-badge"
                      sx={{ 
                        background: `linear-gradient(135deg, ${borderColors[index % borderColors.length]}15 0%, ${borderColors[index % borderColors.length]}05 100%)`,
                        borderRadius: 2,
                        p: { xs: 2, md: 2.5 },
                        mb: 2,
                        textAlign: 'center',
                        border: `2px solid ${borderColors[index % borderColors.length]}20`,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          left: -2,
                          right: -2,
                          height: 2,
                          background: gradients[index % gradients.length],
                        }
                      }}
                    >
                      <Typography 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '2.5rem', md: '3rem' },
                          background: gradients[index % gradients.length],
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          mb: 0.5,
                          lineHeight: 1
                        }}
                      >
                        {category.productCount}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          letterSpacing: '1px',
                          fontSize: { xs: '0.7rem', md: '0.75rem' },
                          color: borderColors[index % borderColors.length],
                        }}
                      >
                        Boxes in folder
                      </Typography>
                    </Box>

                    {/* Action Buttons - Always visible on mobile, hover on desktop */}
                    <Box 
                      className="action-buttons"
                      sx={{ 
                        display: 'flex', 
                        gap: 1,
                        // Always visible on mobile
                        opacity: { xs: 1, md: 0 },
                        transform: { xs: 'translateY(0)', md: 'translateY(10px)' },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenDialog(category)
                        }}
                        sx={{ 
                          bgcolor: 'primary.main',
                          color: 'white',
                          p: 0.75,
                          '&:hover': {
                            bgcolor: 'primary.dark',
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(category)
                        }}
                        sx={{ 
                          bgcolor: 'rgba(0,0,0,0.05)',
                          color: 'error.main',
                          border: '1px solid rgba(0,0,0,0.1)',
                          p: 0.75,
                          '&:hover': {
                            bgcolor: 'error.main',
                            color: 'white',
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
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
          {editingCategory ? 'Edit folder' : 'Add new folder'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Folder name"
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
            Are you sure you want to delete folder "{categoryToDelete?.name}"? This action cannot be undone.
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

