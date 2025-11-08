import { useState, useEffect } from 'react'
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material'
import {
  TrendingUp,
  Inventory,
  Warning,
  ShoppingCart,
} from '@mui/icons-material'
import { productAPI } from '../services/api'
import { StatCardSkeleton } from '../components/Loading'

const StatCard = ({ title, value, icon, gradient, trend }) => (
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
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TrendingUp sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.9)' }} />
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
            {trend}
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const statsRes = await productAPI.getStats()
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              title="Total stock added"
              value={stats?.totalStockAdded || 0}
              icon={<Inventory sx={{ color: 'white', fontSize: 28 }} />}
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              title="Boxes Sold"
              value={stats?.totalSold || 0}
              icon={<ShoppingCart sx={{ color: 'white', fontSize: 28 }} />}
              gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              title="Boxes Returned"
              value={stats?.totalReturned || 0}
              icon={<Warning sx={{ color: 'white', fontSize: 28 }} />}
              gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              title="Boxes Remaining"
              value={stats?.totalRemaining || 0}
              icon={<Inventory sx={{ color: 'white', fontSize: 28 }} />}
              gradient="linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)"
            // trend="In stock now"
            />
          )}
        </Grid>
      </Grid>


      {/* Cards */}
      {/* <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
              Low stock alerts
            </Typography>
            {loading ? (
              <AccordionSkeleton count={4} />
            ) : lowStockProducts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No low stock boxes
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
      </Grid> */}
    </Box>
  )
}
