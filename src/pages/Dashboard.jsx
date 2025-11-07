import { useState, useEffect } from 'react'
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  TrendingUp,
  Inventory,
  Warning,
  ShoppingCart,
  AttachMoney,
} from '@mui/icons-material'
import { BarChart } from '@mui/x-charts/BarChart'
import { PieChart } from '@mui/x-charts/PieChart'
import { productAPI, returnAPI } from '../services/api'
import { StatCardSkeleton, AccordionSkeleton } from '../components/Loading'

const StatCard = ({ title, value, icon, gradient, trend }) => (
  <Card>
    <CardContent sx={{ py: 2, px: 2, '&:last-child': { pb: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="caption" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {value}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
              <Typography variant="caption" color="success.main">
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            background: gradient,
            borderRadius: 1.5,
            p: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
)


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

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [recentReturnsData, setRecentReturnsData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, productsRes, returnsRes] = await Promise.all([
        productAPI.getStats(),
        productAPI.getAll({ limit: 100 }),
        returnAPI.getAll({ limit: 4 })
      ])

      setStats(statsRes.data)
      const lowStock = productsRes.data.products.filter(p => p.status === 'Low Stock').slice(0, 4)
      setLowStockProducts(lowStock)
      setRecentReturnsData(returnsRes.data.returns)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              title="Total Stock Added"
              value={stats?.totalStockAdded || 0}
              icon={<Inventory sx={{ color: 'white', fontSize: 28 }} />}
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              trend="All time"
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
              icon={<ShoppingCart sx={{ color: 'white', fontSize: 28 }} />}
              gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
              trend="+15% from last month"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              title="Items Returned"
              value={stats?.totalReturned || 0}
              icon={<Warning sx={{ color: 'white', fontSize: 28 }} />}
              gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              trend="Restocked"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              title="Items Remaining"
              value={stats?.totalRemaining || 0}
              icon={<Inventory sx={{ color: 'white', fontSize: 28 }} />}
              gradient="linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)"
              trend="In stock now"
            />
          )}
        </Grid>
      </Grid>


      {/* Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Low Stock Alerts
            </Typography>
            {loading ? (
              <AccordionSkeleton count={4} />
            ) : lowStockProducts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No low stock items
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {lowStockProducts.map((item) => (
                  <Accordion key={item._id}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ minHeight: '48px', '& .MuiAccordionSummary-content': { my: 1 } }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', flex: 1 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                          {item.stock}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 1, pb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        SKU: {item.sku}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Recent Returns
            </Typography>
            {loading ? (
              <AccordionSkeleton count={4} />
            ) : recentReturnsData.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No recent returns
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {recentReturnsData.map((item) => (
                  <Accordion key={item._id}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ minHeight: '48px', '& .MuiAccordionSummary-content': { my: 1 } }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', flex: 1 }}>
                          {item.productName || item.product?.name || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                          Qty: {item.quantity || 0}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 1, pb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        SKU: {item.productSku || item.product?.sku || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Date: {item.returnDate ? new Date(item.returnDate).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
