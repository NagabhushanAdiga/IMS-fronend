import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import { PieChart } from '@mui/x-charts/PieChart'
import {
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material'
import { productAPI, categoryAPI, saleAPI } from '../services/api'
import { StatCardSkeleton, AccordionSkeleton } from '../components/Loading'

const StatCard = ({ title, value, change, isPositive }) => (
  <Card>
    <CardContent sx={{ py: 2, px: 2, '&:last-child': { pb: 2 } }}>
      <Typography color="textSecondary" gutterBottom variant="caption" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
        {value}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {isPositive ? (
          <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
        ) : (
          <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
        )}
        <Typography variant="caption" color={isPositive ? 'success.main' : 'error.main'}>
          {change}
        </Typography>
      </Box>
    </CardContent>
  </Card>
)

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchReportsData()
  }, [])

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      const [statsRes, productsRes, categoriesRes] = await Promise.all([
        productAPI.getStats(),
        productAPI.getAll({ limit: 100 }),
        categoryAPI.getAll()
      ])

      setStats(statsRes.data)

      // Get top 5 products by sold quantity
      const sortedProducts = productsRes.data.products
        .sort((a, b) => (b.sold || 0) - (a.sold || 0))
        .slice(0, 5)
        .map((product, index) => ({
          rank: index + 1,
          name: product.name,
          sold: product.sold || 0,
          revenue: (product.sold || 0) * (product.price || 0),
          _id: product._id
        }))

      setTopProducts(sortedProducts)
      setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Error fetching reports data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate category distribution for pie chart
  const categoryData = categories.map((cat, index) => ({
    id: index,
    value: cat.productCount || 0,
    label: cat.name
  })).filter(cat => cat.value > 0)

  // Calculate metrics
  const totalSales = stats ? (stats.totalSold || 0) * 100 : 0 // Approximate
  const avgOrder = topProducts.length > 0
    ? topProducts.reduce((sum, p) => sum + p.revenue, 0) / topProducts.length
    : 0

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Reports & Analytics
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              title="Total Sales"
              value={`₹${totalSales.toFixed(2)}`}
              change="+15.3%"
              isPositive={true}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              title="Average Order"
              value={`₹${avgOrder.toFixed(2)}`}
              change="+8.2%"
              isPositive={true}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              title="Total Products"
              value={stats?.totalStockAdded || 0}
              change="+12.5%"
              isPositive={true}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              title="Items Sold"
              value={stats?.totalSold || 0}
              change="+5.7%"
              isPositive={true}
            />
          )}
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Category Distribution
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                <Skeleton variant="circular" width={300} height={300} />
              </Box>
            ) : categoryData.length > 0 ? (
              <PieChart
                series={[
                  {
                    data: categoryData,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                  },
                ]}
                height={350}
              />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                <Typography variant="body2" color="text.secondary">
                  No category data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>


      {/* Top Products Cards */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Top Selling Products
        </Typography>
        {loading ? (
          <AccordionSkeleton count={5} />
        ) : topProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body2" color="text.secondary">
              No product data available
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {topProducts.map((product) => (
              <Accordion key={product._id}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ minHeight: '48px', '& .MuiAccordionSummary-content': { my: 1 } }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 2 }}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.75rem' }}>
                        #{product.rank}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', flex: 1 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      ₹{product.revenue.toFixed(2)}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 1, pb: 2 }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Units Sold
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {product.sold}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Total Revenue
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        ₹{product.revenue.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  )
}
