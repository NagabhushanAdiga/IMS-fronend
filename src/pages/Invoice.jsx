import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  RequestQuote as InvoiceIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material'
import CustomSnackbar from '../components/Snackbar'
import { authAPI, productAPI } from '../services/api'
import { printInvoice, buildUpiPaymentUrl } from '../utils/invoicePrintTemplate'
import QRCode from 'qrcode'

const STATIC_INVOICES = [
  { id: '1', invoiceNumber: 'INV-2024-001', customerName: 'Raj Traders', date: '2024-01-15', amount: 45800, status: 'Paid' },
  { id: '2', invoiceNumber: 'INV-2024-002', customerName: 'S Kumar & Sons', date: '2024-01-18', amount: 127500, status: 'Paid' },
  { id: '3', invoiceNumber: 'INV-2024-003', customerName: 'Mehta Hardware', date: '2024-01-22', amount: 89300, status: 'Pending' },
  { id: '4', invoiceNumber: 'INV-2024-004', customerName: 'Patel Electronics', date: '2024-01-25', amount: 215600, status: 'Paid' },
  { id: '5', invoiceNumber: 'INV-2024-005', customerName: 'Sharma & Co', date: '2024-01-28', amount: 54200, status: 'Pending' },
]

const initialLineItem = (product = null) => ({
  product: null,
  description: '',
  quantity: 1,
  rate: product?.price || 0,
  amount: product?.price || 0,
})

const formatCurrency = (val) => {
  const n = parseFloat(val) || 0
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

const getStatusColor = (status) => {
  const colors = { Paid: 'success', Pending: 'warning', Overdue: 'error' }
  return colors[status] || 'default'
}

export default function Invoice() {
  const [invoices, setInvoices] = useState(STATIC_INVOICES)
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [products, setProducts] = useState([])
  const [profile, setProfile] = useState(null)
  const [taxRate, setTaxRate] = useState(0)
  const [discountPercentage, setDiscountPercentage] = useState(0)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [invoice, setInvoice] = useState({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerEmail: '',
    customerGstin: '',
  })
  const [lineItems, setLineItems] = useState([initialLineItem()])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [viewDialogQrCode, setViewDialogQrCode] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState(null)

  const shopName = profile?.shopName || profile?.company || 'Soni Traders'

  const getProductPrice = (p) => parseFloat(p?.price ?? p?.unitPrice ?? p?.sellingPrice ?? 0) || 0

  const updateLineItem = (index, field, value, product = null) => {
    const updated = [...lineItems]
    if (field === 'product' && product) {
      const boxPrice = getProductPrice(product)
      const qty = Math.max(1, parseInt(updated[index].quantity, 10) || 1)
      updated[index] = {
        ...updated[index],
        product,
        description: product.name || product.description || '',
        rate: boxPrice,
        quantity: qty,
        amount: boxPrice * qty,
      }
    } else if (field === 'quantity') {
      const qty = Math.max(1, parseInt(value, 10) || 1)
      const rate = parseFloat(updated[index].rate) || getProductPrice(updated[index].product)
      updated[index] = { ...updated[index], quantity: qty, rate, amount: rate * qty }
    } else if (field === 'rate') {
      const rate = parseFloat(value) || 0
      updated[index] = { ...updated[index], rate, amount: rate * (updated[index].quantity || 1) }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setLineItems(updated)
  }

  const addLineItem = () => {
    setLineItems([...lineItems, initialLineItem()])
  }

  const removeLineItem = (index) => {
    if (lineItems.length <= 1) return
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const subtotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  const discountAmount = subtotal * (parseFloat(discountPercentage) || 0) / 100
  const amountAfterDiscount = subtotal - discountAmount
  const taxAmount = amountAfterDiscount * (parseFloat(taxRate) || 0) / 100
  const total = amountAfterDiscount + taxAmount

  useEffect(() => {
    authAPI.getProfile()
      .then(({ data }) => {
        setProfile(data)
        const td = data.taxAndDiscount || {}
        setTaxRate(td.taxPercentage ?? data.taxPercentage ?? 0)
        setDiscountPercentage(td.discountPercentage ?? data.discountPercentage ?? 0)
      })
      .catch(() => setProfile(null))
  }, [])

  useEffect(() => {
    if (generateDialogOpen) {
      setLoadingProducts(true)
      productAPI.getAll()
        .then(({ data }) => {
          const list = data.products || data || []
          const all = Array.isArray(list) ? list : []
          const inStock = all.filter((p) => {
            const total = parseFloat(p.totalStock) || 0
            const sold = parseFloat(p.sold) || 0
            const returned = parseFloat(p.returned) || 0
            const available = total - sold + returned
            return available > 0
          })
          setProducts(inStock)
        })
        .catch(() => setProducts([]))
        .finally(() => setLoadingProducts(false))
    }
  }, [generateDialogOpen])

  useEffect(() => {
    if (viewDialogOpen && selectedInvoice) {
      let qr = profile?.paymentQrCode || null
      if (qr) {
        setViewDialogQrCode(qr)
      } else if (profile?.upiVpa) {
        const shopNameVal = profile?.shopName || profile?.company || 'Soni Traders'
        const upiUrl = buildUpiPaymentUrl(profile?.upiVpa, shopNameVal, selectedInvoice.amount, `Invoice ${selectedInvoice.invoiceNumber}`)
        if (upiUrl) {
          QRCode.toDataURL(upiUrl, { width: 140, margin: 1 }).then(setViewDialogQrCode).catch(() => setViewDialogQrCode(null))
        } else {
          QRCode.toDataURL('upi://pay?pa=demo@paytm&pn=Demo&am=' + selectedInvoice.amount + '&cu=INR&tn=Invoice', { width: 140, margin: 1 }).then(setViewDialogQrCode).catch(() => setViewDialogQrCode(null))
        }
      } else {
        // Dummy QR for preview
        QRCode.toDataURL('upi://pay?pa=demo@paytm&pn=Demo&am=' + (selectedInvoice.amount || 0) + '&cu=INR&tn=Invoice', { width: 140, margin: 1 }).then(setViewDialogQrCode).catch(() => setViewDialogQrCode(null))
      }
    } else {
      setViewDialogQrCode(null)
    }
  }, [viewDialogOpen, selectedInvoice, profile?.paymentQrCode, profile?.upiVpa, profile?.shopName, profile?.company])

  const handleOpenGenerate = () => {
    setInvoice({
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      customerName: '',
      customerAddress: '',
      customerPhone: '',
      customerEmail: '',
      customerGstin: '',
    })
    setLineItems([initialLineItem()])
    setGenerateDialogOpen(true)
  }

  const handleCloseGenerate = () => {
    setGenerateDialogOpen(false)
  }

  const handleGenerate = async () => {
    if (!invoice.customerName.trim()) {
      setSnackbar({ open: true, message: 'Please enter customer name', severity: 'warning' })
      return
    }
    const validItems = lineItems.filter((item) => item.product)
    if (validItems.length === 0) {
      setSnackbar({ open: true, message: 'Please add at least one item - select a box from the dropdown', severity: 'warning' })
      return
    }
    const newInvoice = {
      id: Date.now().toString(),
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      customerAddress: invoice.customerAddress,
      customerPhone: invoice.customerPhone,
      customerEmail: invoice.customerEmail,
      customerGstin: invoice.customerGstin,
      date: invoice.date,
      amount: total,
      status: 'Pending',
      lineItems: validItems,
      subtotal,
      discountPercentage,
      discountAmount,
      taxRate,
      taxAmount,
    }
    setInvoices([newInvoice, ...invoices])
    setSnackbar({ open: true, message: 'Invoice generated!', severity: 'success' })
    setGenerateDialogOpen(false)
    const shopNameVal = profile?.shopName || profile?.company || 'Soni Traders'
    let qrCodeDataUrl = profile?.paymentQrCode || null
    if (!qrCodeDataUrl) {
      const upiUrl = buildUpiPaymentUrl(profile?.upiVpa, shopNameVal, total, `Invoice ${invoice.invoiceNumber}`)
      if (upiUrl) {
        try {
          qrCodeDataUrl = await QRCode.toDataURL(upiUrl, { width: 140, margin: 1 })
        } catch (_) {}
      } else {
        // Dummy QR for preview - add your QR in Settings
        try {
          qrCodeDataUrl = await QRCode.toDataURL('upi://pay?pa=demo@paytm&pn=Your%20Business&am=' + total + '&cu=INR&tn=Invoice%20' + invoice.invoiceNumber, { width: 140, margin: 1 })
        } catch (_) {}
      }
    }
    printInvoice({
      shopName: shopNameVal,
      shopAddress: profile?.address,
      shopCity: profile?.city,
      shopState: profile?.state,
      shopDistrict: profile?.district,
      shopPhone: profile?.phone,
      shopGstin: profile?.gstin,
      shopUpiVpa: profile?.upiVpa,
      bankName: profile?.bankName,
      bankAccountHolder: profile?.bankAccountHolder,
      bankAccountNumber: profile?.bankAccountNumber,
      bankIfsc: profile?.bankIfsc,
      bankBranch: profile?.bankBranch,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.date,
      customerName: invoice.customerName,
      customerAddress: invoice.customerAddress,
      customerPhone: invoice.customerPhone,
      customerEmail: invoice.customerEmail,
      customerGstin: invoice.customerGstin,
      lineItems: newInvoice.lineItems,
      subtotal,
      discountPercentage,
      discountAmount,
      taxRate,
      taxAmount,
      total,
      qrCodeDataUrl,
    })
  }

  const handleViewInvoice = (inv) => {
    setSelectedInvoice(inv)
    setViewDialogOpen(true)
  }

  const handleDeleteClick = (inv) => {
    setInvoiceToDelete(inv)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (invoiceToDelete) {
      setInvoices(invoices.filter((i) => i.id !== invoiceToDelete.id))
      if (selectedInvoice?.id === invoiceToDelete.id) setViewDialogOpen(false)
      setSnackbar({ open: true, message: 'Invoice deleted', severity: 'success' })
    }
    setDeleteDialogOpen(false)
    setInvoiceToDelete(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setInvoiceToDelete(null)
  }

  const handlePrintInvoice = async (inv) => {
    const shopNameVal = profile?.shopName || profile?.company || 'Soni Traders'
    let qrCodeDataUrl = profile?.paymentQrCode || null
    if (!qrCodeDataUrl) {
      const totalAmt = inv.amount ?? (inv.subtotal - (inv.discountAmount || 0) + (inv.taxAmount || 0))
      const upiUrl = buildUpiPaymentUrl(profile?.upiVpa, shopNameVal, totalAmt, `Invoice ${inv.invoiceNumber}`)
      if (upiUrl) {
        try {
          qrCodeDataUrl = await QRCode.toDataURL(upiUrl, { width: 140, margin: 1 })
        } catch (_) {}
      } else {
        try {
          qrCodeDataUrl = await QRCode.toDataURL('upi://pay?pa=demo@paytm&pn=Your%20Business&am=' + totalAmt + '&cu=INR&tn=Invoice%20' + inv.invoiceNumber, { width: 140, margin: 1 })
        } catch (_) {}
      }
    }
    printInvoice({
      shopName: shopNameVal,
      shopAddress: profile?.address,
      shopCity: profile?.city,
      shopState: profile?.state,
      shopDistrict: profile?.district,
      shopPhone: profile?.phone,
      shopGstin: profile?.gstin,
      shopUpiVpa: profile?.upiVpa,
      bankName: profile?.bankName,
      bankAccountHolder: profile?.bankAccountHolder,
      bankAccountNumber: profile?.bankAccountNumber,
      bankIfsc: profile?.bankIfsc,
      bankBranch: profile?.bankBranch,
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.date,
      customerName: inv.customerName,
      customerAddress: inv.customerAddress || '',
      customerPhone: inv.customerPhone || '',
      customerEmail: inv.customerEmail || '',
      customerGstin: inv.customerGstin || '',
      lineItems: inv.lineItems || [],
      subtotal: inv.subtotal ?? inv.amount,
      discountPercentage: inv.discountPercentage ?? 0,
      discountAmount: inv.discountAmount ?? 0,
      taxRate: inv.taxRate ?? 0,
      taxAmount: inv.taxAmount ?? 0,
      total: inv.amount,
      qrCodeDataUrl,
    })
  }

  const invoiceGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  const invoiceAccent = '#667eea'

  const generateDialogContent = (
    <Box id="invoice-content" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box
        sx={{
          background: invoiceGradient,
          color: 'white',
          p: 2.5,
          mb: 2,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.35)',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>{shopName}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>Invoice #{invoice.invoiceNumber}</Typography>
          {profile && (
            <Box sx={{ mt: 1, fontSize: '0.75rem', opacity: 0.9 }}>
              {profile.address && <Typography variant="caption" display="block">{profile.address}</Typography>}
              {(profile.city || profile.state) && <Typography variant="caption" display="block">{[profile.city, profile.state, profile.district].filter(Boolean).join(', ')}</Typography>}
              {profile.phone && <Typography variant="caption">Ph: {profile.phone}</Typography>}
              {profile.gstin && <Typography variant="caption"> | GSTIN: {profile.gstin}</Typography>}
            </Box>
          )}
        </Box>
        <TextField
          size="small"
          label="Date"
          type="date"
          value={invoice.date}
          onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={{
            maxWidth: 180,
            bgcolor: 'rgba(255,255,255,0.15)',
            borderRadius: 1,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.9)' },
            '& .MuiInputBase-input': { color: 'white' },
          }}
        />
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 2,
          borderLeft: 4,
          borderColor: invoiceAccent,
          bgcolor: (theme) => theme.palette.mode === 'light' ? 'grey.50' : 'action.hover',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PersonIcon sx={{ color: invoiceAccent, fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Bill To</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Customer Name" value={invoice.customerName} onChange={(e) => setInvoice({ ...invoice, customerName: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Phone" value={invoice.customerPhone} onChange={(e) => setInvoice({ ...invoice, customerPhone: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Address" multiline rows={2} value={invoice.customerAddress} onChange={(e) => setInvoice({ ...invoice, customerAddress: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Email" type="email" value={invoice.customerEmail} onChange={(e) => setInvoice({ ...invoice, customerEmail: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Customer GSTIN" placeholder="e.g. 22AAAAA0000A1Z5" value={invoice.customerGstin} onChange={(e) => setInvoice({ ...invoice, customerGstin: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }} />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, borderLeft: 4, borderColor: invoiceAccent }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon sx={{ color: invoiceAccent, fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Items</Typography>
          </Box>
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addLineItem} sx={{ borderColor: invoiceAccent, color: invoiceAccent }}>
            Add Item
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: (theme) => theme.palette.mode === 'light' ? 'grey.100' : 'action.hover' }}>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell align="right" sx={{ width: 90, fontWeight: 600 }}>Qty</TableCell>
                <TableCell align="right" sx={{ width: 110, fontWeight: 600 }}>Rate (₹)</TableCell>
                <TableCell align="right" sx={{ width: 110, fontWeight: 600 }}>Amount</TableCell>
                <TableCell align="center" sx={{ width: 48 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lineItems.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{ minWidth: 200 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`product-${index}`}>Select box</InputLabel>
                      <Select
                        labelId={`product-${index}`}
                        label="Select box"
                        value={item.product?._id || item.product?.id || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          const p = val ? products.find((pr) => (pr._id || pr.id) === val) : null
                          updateLineItem(index, 'product', null, p)
                        }}
                      >
                        <MenuItem value=""><em>Select box</em></MenuItem>
                        {products.map((p) => (
                          <MenuItem key={p._id || p.id} value={p._id || p.id}>{p.name || p.description || '-'}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                      inputProps={{ min: 1, step: 1 }}
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                      sx={{ width: 65, '& .MuiInput-root': { fontSize: '0.875rem' } }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={item.rate === 0 || item.rate === '' ? '' : item.rate}
                      onChange={(e) => updateLineItem(index, 'rate', e.target.value)}
                      inputProps={{ min: 0, step: 0.01 }}
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                      sx={{ width: 90, '& .MuiInput-root': { fontSize: '0.875rem' } }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => removeLineItem(index)} disabled={lineItems.length <= 1} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}></Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'light' ? 'grey.50' : 'action.hover' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 4, width: '100%', maxWidth: 240, justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography fontWeight={500}>{formatCurrency(subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%', maxWidth: 240, justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Discount (%)</Typography>
                <TextField size="small" type="number" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} inputProps={{ min: 0, max: 100, step: 0.5 }} sx={{ width: 85, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }} />
              </Box>
              {discountPercentage > 0 && (
                <Box sx={{ display: 'flex', gap: 4, width: '100%', maxWidth: 240, justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Discount ({discountPercentage}%)</Typography>
                  <Typography fontWeight={500}>-{formatCurrency(discountAmount)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 4, width: '100%', maxWidth: 240, justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Tax ({taxRate}%)</Typography>
                <Typography fontWeight={500}>{formatCurrency(taxAmount)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 4, width: '100%', maxWidth: 240, justifyContent: 'space-between', mt: 0.5, pt: 2, borderTop: 2, borderColor: invoiceAccent }}>
                <Typography fontWeight={700} sx={{ fontSize: '1.1rem' }}>Total</Typography>
                <Typography fontWeight={700} sx={{ fontSize: '1.1rem', color: invoiceAccent }}>{formatCurrency(total)}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Invoices</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenGenerate}>Generate Invoice</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 600 }}>Invoice #</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id} hover>
                <TableCell>{inv.invoiceNumber}</TableCell>
                <TableCell>{inv.customerName}</TableCell>
                <TableCell>{inv.date}</TableCell>
                <TableCell align="right">{formatCurrency(inv.amount)}</TableCell>
                <TableCell><Chip label={inv.status} color={getStatusColor(inv.status)} size="small" /></TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleViewInvoice(inv)} title="View"><VisibilityIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => handlePrintInvoice(inv)} title="Print"><PrintIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => handleDeleteClick(inv)} title="Delete" sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={generateDialogOpen} onClose={handleCloseGenerate} maxWidth="md" fullWidth PaperProps={{ sx: { maxHeight: '90vh', borderRadius: 3, boxShadow: '0 24px 80px rgba(0,0,0,0.15)' } }}>
        <Box sx={{ background: invoiceGradient, color: 'white', py: 2, px: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InvoiceIcon /> Generate Invoice
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>Fill in the details to create and print an invoice</Typography>
        </Box>
        <DialogContent sx={{ p: 3, bgcolor: (theme) => theme.palette.mode === 'light' ? 'grey.50' : 'background.default' }}>
          {loadingProfile ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box> : generateDialogContent}
        </DialogContent>
        <Box sx={{ p: 2.5, display: 'flex', gap: 2, justifyContent: 'flex-end', bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleCloseGenerate}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handleGenerate}
            sx={{ background: invoiceGradient, px: 3, boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)' }}
          >
            Generate
          </Button>
        </Box>
      </Dialog>

      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <Box sx={{ background: invoiceGradient, color: 'white', py: 2, px: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <VisibilityIcon /> Invoice Details
          </Typography>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          {selectedInvoice && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2"><strong>Invoice #:</strong> {selectedInvoice.invoiceNumber}</Typography>
              <Typography variant="body2"><strong>Customer:</strong> {selectedInvoice.customerName}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {selectedInvoice.date}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: invoiceAccent }}>Amount: {formatCurrency(selectedInvoice.amount)}</Typography>
                <Chip label={selectedInvoice.status} color={getStatusColor(selectedInvoice.status)} size="small" />
              </Box>
              {(viewDialogQrCode || profile?.bankName || profile?.bankAccountNumber) && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  {(profile?.bankName || profile?.bankAccountNumber || profile?.bankAccountHolder || profile?.bankIfsc || profile?.bankBranch) && (
                    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50', minWidth: 200 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>Bank Details</Typography>
                      {profile?.bankAccountHolder && <Typography variant="caption" display="block"><strong>Account Holder:</strong> {profile.bankAccountHolder}</Typography>}
                      {profile?.bankName && <Typography variant="caption" display="block"><strong>Bank:</strong> {profile.bankName}</Typography>}
                      {profile?.bankBranch && <Typography variant="caption" display="block"><strong>Branch:</strong> {profile.bankBranch}</Typography>}
                      {profile?.bankAccountNumber && <Typography variant="caption" display="block"><strong>Account No:</strong> {profile.bankAccountNumber}</Typography>}
                      {profile?.bankIfsc && <Typography variant="caption" display="block"><strong>IFSC:</strong> {profile.bankIfsc}</Typography>}
                    </Box>
                  )}
                  {viewDialogQrCode && (
                    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50', textAlign: 'center' }}>
                      <Box component="img" src={viewDialogQrCode} alt="Pay via QR" sx={{ width: 140, height: 140 }} />
                      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>Scan to pay</Typography>
                      {profile?.upiVpa && <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>{profile.upiVpa}</Typography>}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <Box sx={{ p: 2.5, display: 'flex', gap: 2, justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => selectedInvoice && handlePrintInvoice(selectedInvoice)} sx={{ background: invoiceGradient }}>Print</Button>
        </Box>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete invoice {invoiceToDelete?.invoiceNumber}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} />
    </Box>
  )
}
