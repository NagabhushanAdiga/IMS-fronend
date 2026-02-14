import QRCode from 'qrcode'

/**
 * Builds UPI payment deep link for dynamic QR
 */
export function buildUpiPaymentUrl(upiVpa, payeeName, amount, note) {
  if (!upiVpa || !upiVpa.trim()) return null
  const params = new URLSearchParams()
  params.set('pa', upiVpa.trim())
  if (payeeName) params.set('pn', payeeName)
  if (amount != null && amount > 0) params.set('am', String(Number(amount).toFixed(2)))
  params.set('cu', 'INR')
  if (note) params.set('tn', note)
  return `upi://pay?${params.toString()}`
}

/**
 * Generates a standard invoice HTML template for printing
 */
const formatCurrency = (val) => {
  const n = parseFloat(val) || 0
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export function getInvoicePrintHtml({
  shopName,
  shopAddress,
  shopCity,
  shopState,
  shopDistrict,
  shopPhone,
  shopGstin,
  shopUpiVpa,
  bankName,
  bankAccountHolder,
  bankAccountNumber,
  bankIfsc,
  bankBranch,
  invoiceNumber,
  invoiceDate,
  customerName,
  customerAddress,
  customerPhone,
  customerEmail,
  customerGstin,
  lineItems,
  subtotal,
  discountPercentage = 0,
  discountAmount = 0,
  taxRate,
  taxAmount,
  total,
  qrCodeDataUrl,
}) {
  const itemsHtml = (lineItems || [])
    .filter((item) => item.product || item.description)
    .map(
      (item, i) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${i + 1}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${item.description || item.product?.name || item.product?.description || '-'}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">${item.quantity || 1}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.rate)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.amount)}</td>
      </tr>`
    )
    .join('')

  const addressParts = [shopAddress, [shopCity, shopState, shopDistrict].filter(Boolean).join(', ')].filter(Boolean)
  const shopAddressStr = addressParts.join('<br>')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #333; line-height: 1.5; padding: 24px; max-width: 800px; margin: 0 auto; }
    .invoice-title { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #667eea; }
    .invoice-title h1 { font-size: 22px; color: #667eea; margin-bottom: 4px; }
    .invoice-title .inv-num { font-size: 16px; font-weight: 700; color: #333; }
    .invoice-title .date { font-size: 13px; color: #666; }
    .bill-section { margin-bottom: 24px; padding: 16px; border: 1px solid #eee; border-radius: 8px; background: #fafafa; }
    .bill-section h3 { font-size: 12px; color: #667eea; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .bill-section .name { font-weight: 600; font-size: 15px; margin-bottom: 4px; }
    .bill-section .details { font-size: 13px; color: #555; line-height: 1.6; }
    .bill-rows { display: flex; gap: 24px; flex-wrap: wrap; }
    .bill-from { flex: 1; min-width: 280px; }
    .bill-to { flex: 1; min-width: 280px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #667eea; color: white; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; }
    th:last-child, td:last-child { text-align: right; }
    th:nth-child(3), th:nth-child(4) { text-align: right; }
    td:nth-child(3), td:nth-child(4) { text-align: right; }
    .totals { margin-left: auto; width: 280px; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 16px; background: #fafafa; }
    .totals-row.grand { background: #667eea; color: white; font-size: 16px; font-weight: 700; padding: 12px 16px; }
    .payment-section { margin-top: 24px; }
    .payment-row { display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; }
    .bank-details { flex: 1; min-width: 200px; padding: 12px 16px; border: 1px solid #eee; border-radius: 8px; background: #fafafa; }
    .payment-heading { font-size: 12px; color: #667eea; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .bank-line { font-size: 13px; color: #555; line-height: 1.6; }
    .qr-box { text-align: center; padding: 12px; border: 1px solid #eee; border-radius: 8px; background: #fafafa; }
    .qr-label { font-size: 12px; color: #666; margin-top: 6px; }
    .qr-vpa { font-size: 11px; color: #888; margin-top: 2px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="invoice-title">
    <h1>TAX INVOICE</h1>
    <div class="inv-num">#${invoiceNumber}</div>
    <div class="date">Date: ${invoiceDate}</div>
  </div>

  <div class="bill-rows">
    <div class="bill-section bill-from">
      <h3>Bill From</h3>
      <div class="name">${shopName || 'Soni Traders'}</div>
      ${shopAddressStr ? `<div class="details">${shopAddressStr}</div>` : ''}
      ${shopPhone ? `<div class="details">Ph: ${shopPhone}</div>` : ''}
      ${shopGstin ? `<div class="details">GSTIN: ${shopGstin}</div>` : ''}
    </div>
    <div class="bill-section bill-to">
      <h3>Bill To</h3>
      <div class="name">${customerName || '-'}</div>
      ${customerAddress ? `<div class="details">${customerAddress}</div>` : ''}
      ${customerPhone || customerEmail ? `<div class="details">${[customerPhone, customerEmail].filter(Boolean).join(' | ')}</div>` : ''}
      ${customerGstin ? `<div class="details">GSTIN: ${customerGstin}</div>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml || '<tr><td colspan="5" style="padding: 20px; text-align: center;">No items</td></tr>'}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal</span>
      <span>${formatCurrency(subtotal)}</span>
    </div>
    ${discountPercentage > 0 ? `
    <div class="totals-row">
      <span>Discount (${discountPercentage}%)</span>
      <span>-${formatCurrency(discountAmount)}</span>
    </div>
    ` : ''}
    ${taxRate > 0 ? `
    <div class="totals-row">
      <span>Tax (${taxRate}%)</span>
      <span>${formatCurrency(taxAmount)}</span>
    </div>
    ` : ''}
    <div class="totals-row grand">
      <span>Total</span>
      <span>${formatCurrency(total)}</span>
    </div>
  </div>

  <div class="payment-section">
    ${(bankName || bankAccountNumber || bankIfsc || qrCodeDataUrl) ? `
    <div class="payment-row">
      ${(bankName || bankAccountNumber || bankAccountHolder || bankIfsc || bankBranch) ? `
      <div class="bank-details">
        <h4 class="payment-heading">Bank Details</h4>
        ${bankAccountHolder ? `<div class="bank-line"><strong>Account Holder:</strong> ${bankAccountHolder}</div>` : ''}
        ${bankName ? `<div class="bank-line"><strong>Bank:</strong> ${bankName}</div>` : ''}
        ${bankBranch ? `<div class="bank-line"><strong>Branch:</strong> ${bankBranch}</div>` : ''}
        ${bankAccountNumber ? `<div class="bank-line"><strong>Account No:</strong> ${bankAccountNumber}</div>` : ''}
        ${bankIfsc ? `<div class="bank-line"><strong>IFSC:</strong> ${bankIfsc}</div>` : ''}
      </div>
      ` : ''}
      ${qrCodeDataUrl ? `
      <div class="qr-box">
        <img src="${qrCodeDataUrl}" alt="Pay via QR" width="140" height="140" />
        <div class="qr-label">Scan to pay</div>
        ${shopUpiVpa ? `<div class="qr-vpa">${shopUpiVpa}</div>` : ''}
      </div>
      ` : ''}
    </div>
    ` : ''}
  </div>

  <div class="footer">
    Thank you for your business!
  </div>
</body>
</html>
  `.trim()
}

export function printInvoice(data) {
  const html = getInvoicePrintHtml(data)
  const printFrame = document.getElementById('invoice-print-frame')
  if (printFrame) {
    const doc = printFrame.contentDocument || printFrame.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(html)
      doc.close()
      printFrame.contentWindow?.focus()
      setTimeout(() => {
        printFrame.contentWindow?.print()
      }, 300)
      return
    }
  }
  const iframe = document.createElement('iframe')
  iframe.id = 'invoice-print-frame'
  iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;'
  document.body.appendChild(iframe)
  const doc = iframe.contentDocument || iframe.contentWindow?.document
  doc.open()
  doc.write(html)
  doc.close()
  iframe.contentWindow?.focus()
  setTimeout(() => {
    iframe.contentWindow?.print()
  }, 300)
}
