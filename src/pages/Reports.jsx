import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
} from '@mui/material'
import {
  Inventory,
  ShoppingCart,
  AssignmentReturn,
} from '@mui/icons-material'
import { productAPI, categoryAPI } from '../services/api'

const StatCard = ({ title, value, subtitle, icon, gradient }) => (
  <Card 
    sx={{ 
      background: gradient,
      minHeight: 140,
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
      }
    }}
  >
    <CardContent sx={{ py: 2.5, px: 2.5, flexGrow: 1, '&:last-child': { pb: 2.5 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Typography 
            gutterBottom 
            variant="caption" 
            sx={{ 
              fontSize: '0.75rem', 
              textTransform: 'uppercase', 
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.9)',
              letterSpacing: '0.5px'
            }}
          >
            {title}
          </Typography>
        </Box>
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            p: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography 
        variant="h4" 
        component="div" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 0.5,
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {value}
      </Typography>
      {subtitle && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.85)',
            fontWeight: 500
          }}
        >
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
)

export default function Reports() {
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

  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [allProducts, setAllProducts] = useState([])

  useEffect(() => {
    fetchReportsData()
  }, [])

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAll({ limit: 1000 }),
        categoryAPI.getAll()
      ])

      setAllProducts(productsRes.data.products || [])
      setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Error fetching reports data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate current month statistics based on category filter
  const getFilteredStats = () => {
    let productsToCalculate = allProducts

    // Apply category filter if selected
    if (categoryFilter !== 'all') {
      productsToCalculate = productsToCalculate.filter(product => 
        (product.category?._id || product.category) === categoryFilter
      )
    }

    return {
      totalBoxes: productsToCalculate.length,
      soldBoxes: productsToCalculate.reduce((sum, product) => sum + (product.sold || 0), 0),
      returnedBoxes: productsToCalculate.reduce((sum, product) => sum + (product.returned || 0), 0),
      soldValue: productsToCalculate.reduce((sum, product) => sum + ((product.sold || 0) * (product.price || 0)), 0),
      returnedValue: productsToCalculate.reduce((sum, product) => sum + ((product.returned || 0) * (product.price || 0)), 0),
    }
  }

  const stats = getFilteredStats()
  const selectedCategory = categories.find(cat => cat._id === categoryFilter)
  const currentDate = new Date()
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <Box>
      {/* Header with Month and Filter */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {monthName} Report
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {categoryFilter === 'all' ? 'All folders' : selectedCategory?.name || 'Selected Folder'}
            </Typography>
          </Box>
          <TextField
            label="Filter by folder"
            select
            size="small"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 200 }}
            InputLabelProps={{ sx: { fontSize: '0.875rem' } }}
          >
            <MenuItem value="all">All folders</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total boxes"
            value={stats.totalBoxes}
            subtitle={categoryFilter === 'all' ? 'Across all folders' : `In ${selectedCategory?.name || 'folder'}`}
            icon={<Inventory sx={{ color: 'white', fontSize: 32 }} />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Boxes sold"
            value={stats.soldBoxes}
            subtitle={`Total value: ₹${stats.soldValue.toFixed(2)}`}
            icon={<ShoppingCart sx={{ color: 'white', fontSize: 32 }} />}
            gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Boxes returned"
            value={stats.returnedBoxes}
            subtitle={`Total value: ₹${stats.returnedValue.toFixed(2)}`}
            icon={<AssignmentReturn sx={{ color: 'white', fontSize: 32 }} />}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
        </Grid>
      </Grid>

      {/* Summary Card */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 1, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Net performance (sold - returned)
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main', mt: 0.5 }}>
                {stats.soldBoxes - stats.returnedBoxes} boxes
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                ₹{(stats.soldValue - stats.returnedValue).toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', borderRadius: 1, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Return rate
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main', mt: 0.5 }}>
                {stats.soldBoxes > 0 ? ((stats.returnedBoxes / stats.soldBoxes) * 100).toFixed(1) : 0}%
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {stats.returnedBoxes} of {stats.soldBoxes} boxes
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}
