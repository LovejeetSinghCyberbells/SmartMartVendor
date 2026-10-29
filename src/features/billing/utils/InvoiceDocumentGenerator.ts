export interface InvoiceBillData {
  invoiceNumber: string;
  date: string;
  time: string;
  cashier: string;
  customerPhone: string;
  items: Array<{
    product: {
      id: string;
      name: string;
      category?: string;
      price: number;
      mrp?: number;
      unit: string;
    };
    quantity: number;
  }>;
  totalMrp: number;
  totalDiscount: number;
  subtotal: number;
  tax: number;
  grandTotal: number;
  paymentMode: string;
  cashTendered?: number;
  cashChange?: number;
}

/**
 * Generates a self-contained, printable HTML5 invoice document
 * styled exactly like the "Local Market Invoice" template.
 */
export function generateInvoiceHtml(bill: InvoiceBillData): string {
  const cleanPhone = bill.customerPhone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10
    ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
    : `+91 ${cleanPhone}`;

  const itemRowsHtml = bill.items
    .map((item, index) => {
      const lineTotal = item.product.price * item.quantity;
      const hasDiscount = item.product.mrp && item.product.mrp > item.product.price;
      const mrpHtml = hasDiscount
        ? `<span class="item-mrp">₹${item.product.mrp?.toFixed(2)}</span> `
        : '';
      const savingsHtml = hasDiscount
        ? `<div class="item-save">Save ₹${((item.product.mrp! - item.product.price) * item.quantity).toFixed(2)}</div>`
        : '';

      return `
        <tr>
          <td class="col-product">
            <span class="product-name">${item.product.name}</span>
            <span class="product-unit">(${item.product.unit})</span>
            ${savingsHtml}
          </td>
          <td class="col-price">
            ${mrpHtml}₹${item.product.price.toFixed(2)}
          </td>
          <td class="col-qty">${item.quantity}</td>
          <td class="col-total">₹${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    })
    .join('');

  const discountRowHtml = bill.totalDiscount > 0
    ? `
      <div class="summary-line discount-line">
        <span class="summary-label">STORE DISCOUNT:</span>
        <span class="summary-val">-₹${bill.totalDiscount.toFixed(2)}</span>
      </div>
    `
    : '';

  const cashDetailHtml = bill.paymentMode === 'CASH' && bill.cashTendered
    ? `<div class="tender-line">Tendered: ₹${bill.cashTendered} • Change: ₹${bill.cashChange || 0}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartMart Invoice #${bill.invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Sigmar+One&display=swap');

    @page {
      size: A4 portrait;
      margin: 10mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #2b553e;
      padding: 24px;
      display: flex;
      justify-content: center;
      color: #1e293b;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .invoice-card {
      background: #fdfcf9;
      width: 100%;
      max-width: 680px;
      border-radius: 20px;
      padding: 36px 32px 28px;
      position: relative;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      border: 3px solid #739d84;
    }

    /* Watermark organic market drawings */
    .watermark {
      position: absolute;
      opacity: 0.12;
      pointer-events: none;
      z-index: 0;
    }
    .watermark-pepper { top: 20px; left: 24px; width: 68px; }
    .watermark-pomegranate { top: 18px; right: 28px; width: 72px; }
    .watermark-tomato { top: 460px; left: 24px; width: 64px; }
    .watermark-pear { top: 430px; right: 28px; width: 60px; }

    .content-wrap {
      position: relative;
      z-index: 1;
    }

    /* Header Ribbon */
    .header-ribbon-wrap {
      text-align: center;
      margin-bottom: 24px;
    }

    .ribbon-banner {
      display: inline-block;
      background: #ded7cb;
      color: #2c1e2e;
      font-family: 'Sigmar One', 'Poppins', cursive;
      font-size: 21px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 8px 38px;
      border-radius: 4px;
      position: relative;
      box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    }

    .ribbon-banner::before,
    .ribbon-banner::after {
      content: '';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      border: 8px solid transparent;
    }
    .ribbon-banner::before {
      left: -16px;
      border-right-color: #ded7cb;
    }
    .ribbon-banner::after {
      right: -16px;
      border-left-color: #ded7cb;
    }

    .ribbon-sub {
      font-family: 'Sigmar One', 'Poppins', sans-serif;
      font-size: 23px;
      color: #557d62;
      letter-spacing: 1.5px;
      margin-top: 6px;
      text-transform: uppercase;
    }

    /* Meta Columns */
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-top: 14px;
      margin-bottom: 22px;
      font-size: 11.5px;
      line-height: 1.6;
    }

    .meta-col-left {
      flex: 1.2;
    }

    .meta-col-right {
      flex: 1;
      text-align: right;
    }

    .meta-title {
      font-weight: 800;
      font-size: 11.5px;
      color: #0f172a;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .meta-text {
      color: #475569;
      font-weight: 500;
    }

    .meta-highlight {
      font-weight: 700;
      color: #15803d;
    }

    /* Items Table */
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 22px;
    }

    .invoice-table th {
      background: #7ca189;
      color: #ffffff;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 1.2px;
      padding: 10px 12px;
      text-transform: uppercase;
    }

    .invoice-table th:first-child {
      border-radius: 6px 0 0 6px;
      text-align: left;
    }
    .invoice-table th:last-child {
      border-radius: 0 6px 6px 0;
      text-align: right;
    }
    .invoice-table th.th-center {
      text-align: center;
    }
    .invoice-table th.th-right {
      text-align: right;
    }

    .invoice-table td {
      padding: 11px 12px;
      font-size: 12px;
      border-bottom: 1px solid #e9ece8;
      vertical-align: middle;
    }

    .col-product {
      text-align: left;
    }
    .product-name {
      font-weight: 700;
      color: #1e293b;
      display: inline-block;
    }
    .product-unit {
      color: #64748b;
      font-size: 11px;
      margin-left: 4px;
    }
    .item-save {
      font-size: 9.5px;
      font-weight: 700;
      color: #15803d;
      margin-top: 2px;
    }

    .col-price {
      text-align: right;
      font-weight: 600;
      color: #334155;
    }
    .item-mrp {
      text-decoration: line-through;
      color: #94a3b8;
      font-size: 10.5px;
      margin-right: 4px;
    }

    .col-qty {
      text-align: center;
      font-weight: 700;
      color: #1e293b;
    }

    .col-total {
      text-align: right;
      font-weight: 700;
      color: #0f172a;
    }

    /* Summary & Terms Section */
    .bottom-section {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-top: 10px;
      margin-bottom: 24px;
    }

    .terms-box {
      flex: 1.1;
      font-size: 10px;
      line-height: 1.55;
      color: #64748b;
    }

    .terms-title {
      font-weight: 800;
      font-size: 10.5px;
      color: #1e293b;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .summary-box {
      flex: 1;
      text-align: right;
      font-size: 12px;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-weight: 600;
      color: #334155;
    }

    .discount-line {
      color: #15803d;
      font-weight: 700;
    }

    .grand-total-line {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 2px solid #2b553e;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      justify-content: space-between;
    }

    .payment-tag {
      display: inline-block;
      margin-top: 6px;
      background: #eaf5ed;
      color: #15803d;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .tender-line {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 3px;
    }

    /* Bottom Market Illustration Banner */
    .illustration-footer {
      background: #ebe4d8;
      margin: 18px -32px -28px;
      padding: 12px 24px 14px;
      text-align: center;
      border-top: 2px solid #dcd3c4;
      position: relative;
    }

    .veggie-graphics-row {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 16px;
      margin-bottom: 6px;
    }

    .footer-tagline {
      font-size: 10px;
      font-weight: 600;
      color: #6b7280;
      letter-spacing: 0.5px;
    }

    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .invoice-card {
        box-shadow: none;
        max-width: 100%;
        border: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <!-- Watermarks -->
    <svg class="watermark watermark-pepper" viewBox="0 0 100 100" fill="none" stroke="#2b553e" stroke-width="2">
      <path d="M40 20 C20 30 15 70 35 90 C50 95 65 95 80 85 C95 65 90 30 70 20 Z" />
      <path d="M50 20 C50 10 60 5 65 8" />
    </svg>
    <svg class="watermark watermark-pomegranate" viewBox="0 0 100 100" fill="none" stroke="#2b553e" stroke-width="2">
      <circle cx="50" cy="55" r="35" />
      <path d="M40 20 L50 28 L60 20" />
    </svg>
    <svg class="watermark watermark-tomato" viewBox="0 0 100 100" fill="none" stroke="#2b553e" stroke-width="2">
      <ellipse cx="50" cy="55" rx="35" ry="30" />
      <path d="M50 25 L45 15 M50 25 L55 15 M50 25 L40 22 M50 25 L60 22" />
    </svg>
    <svg class="watermark watermark-pear" viewBox="0 0 100 100" fill="none" stroke="#2b553e" stroke-width="2">
      <path d="M50 30 C40 30 35 50 25 70 C20 85 40 95 50 95 C60 95 80 85 75 70 C65 50 60 30 50 30 Z" />
    </svg>

    <div class="content-wrap">
      <!-- Ribbon Header -->
      <div class="header-ribbon-wrap">
        <div class="ribbon-banner">SMARTMART MARKET</div>
        <div class="ribbon-sub">TAX INVOICE</div>
      </div>

      <!-- Meta Row -->
      <div class="meta-row">
        <div class="meta-col-left">
          <div class="meta-title">BILLING TO:</div>
          <div class="meta-text">Customer Mobile: <span class="meta-highlight">${formattedPhone}</span></div>
          <div class="meta-text">Invoice No: <strong>#${bill.invoiceNumber}</strong></div>
          <div class="meta-text">Date & Time: ${bill.date} • ${bill.time}</div>
          <div class="meta-text">Cashier: ${bill.cashier}</div>
        </div>
        <div class="meta-col-right">
          <div class="meta-title">SMARTMART SUPERMARKET</div>
          <div class="meta-text">Store ID: #SM-DL-8821</div>
          <div class="meta-text">GSTIN: 07AAACG1829K1Z4</div>
          <div class="meta-text">Helpdesk: +91 98765 00000</div>
          <div class="meta-text">In-Store Counter Billing</div>
        </div>
      </div>

      <!-- Invoice Table -->
      <table class="invoice-table">
        <thead>
          <tr>
            <th style="width: 46%;">PRODUCT</th>
            <th class="th-right" style="width: 22%;">PRICE</th>
            <th class="th-center" style="width: 12%;">QTY</th>
            <th class="th-right" style="width: 20%;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${itemRowsHtml}
        </tbody>
      </table>

      <!-- Bottom Section -->
      <div class="bottom-section">
        <div class="terms-box">
          <div class="terms-title">TERMS & CONDITIONS:</div>
          <p>Thank you for shopping at SmartMart! Please retain this retail invoice document for any exchange or queries within 7 days of purchase. Items must be in original condition with shelf tags intact.</p>
        </div>

        <div class="summary-box">
          ${bill.totalDiscount > 0 ? `
            <div class="summary-line">
              <span class="summary-label">TOTAL MRP:</span>
              <span class="summary-val">₹${bill.totalMrp.toFixed(2)}</span>
            </div>
          ` : ''}
          ${discountRowHtml}
          <div class="summary-line">
            <span class="summary-label">SUB TOTAL:</span>
            <span class="summary-val">₹${bill.subtotal.toFixed(2)}</span>
          </div>
          <div class="summary-line">
            <span class="summary-label">TAX (5% GST):</span>
            <span class="summary-val">+₹${bill.tax.toFixed(2)}</span>
          </div>
          <div class="grand-total-line">
            <span>TOTAL:</span>
            <span>₹${bill.grandTotal.toFixed(2)}</span>
          </div>
          <div class="payment-tag">PAID VIA ${bill.paymentMode}</div>
          ${cashDetailHtml}
        </div>
      </div>

      <!-- Bottom Illustration Banner -->
      <div class="illustration-footer">
        <div class="veggie-graphics-row">
          <!-- Fresh Tomato -->
          <svg width="34" height="30" viewBox="0 0 40 36">
            <circle cx="20" cy="20" r="15" fill="#e11d48" />
            <path d="M20 6 L18 1 L22 1 Z" fill="#15803d" />
            <path d="M14 8 L20 7 L26 8" stroke="#15803d" stroke-width="2" stroke-linecap="round" />
          </svg>
          <!-- Pumpkin -->
          <svg width="42" height="32" viewBox="0 0 50 36">
            <ellipse cx="25" cy="22" rx="20" ry="14" fill="#ea580c" />
            <ellipse cx="25" cy="22" rx="10" ry="14" fill="#f97316" />
            <rect x="23" y="4" width="4" height="6" rx="2" fill="#78350f" />
          </svg>
          <!-- Watermelon Slice -->
          <svg width="36" height="30" viewBox="0 0 44 36">
            <path d="M4 14 A 20 20 0 0 0 40 14 Z" fill="#15803d" />
            <path d="M6 14 A 18 18 0 0 0 38 14 Z" fill="#ef4444" />
            <circle cx="16" cy="18" r="1.5" fill="#000" />
            <circle cx="22" cy="22" r="1.5" fill="#000" />
            <circle cx="28" cy="18" r="1.5" fill="#000" />
          </svg>
          <!-- Lemon -->
          <svg width="28" height="26" viewBox="0 0 34 30">
            <ellipse cx="17" cy="15" rx="14" ry="10" fill="#facc15" transform="rotate(-15 17 15)" />
          </svg>
          <!-- Radish / Beetroot -->
          <svg width="30" height="32" viewBox="0 0 36 38">
            <ellipse cx="18" cy="24" rx="12" ry="11" fill="#701a75" />
            <path d="M18 13 L14 4 M18 13 L22 4" stroke="#15803d" stroke-width="2.5" stroke-linecap="round" />
          </svg>
        </div>
        <div class="footer-tagline">SmartMart Kirana & Supermarket • Fresh & Organic</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generates an official, compliant PDF-1.4 binary document
 * representing the SmartMart Local Market Invoice.
 */
export function generateInvoicePdf(bill: InvoiceBillData): string {
  const cleanPhone = bill.customerPhone.replace(/\D/g, '');
  const phoneDisplay = `+91 ${cleanPhone}`;

  const content: string[] = [];
  content.push('q');

  // Outer green border frame
  content.push('0.169 0.333 0.243 rg'); // #2b553e
  content.push('0 0 595 842 re f');

  // White parchment paper sheet
  content.push('0.992 0.988 0.976 rg'); // #fdfcf9
  content.push('18 18 559 806 re f');

  // Border outline
  content.push('0.451 0.616 0.518 RG'); // #739d84
  content.push('2 w');
  content.push('18 18 559 806 re S');

  // Top Ribbon Banner
  content.push('0.871 0.843 0.796 rg'); // #ded7cb
  content.push('165 745 265 38 re f');

  // Ribbon Title: SMARTMART MARKET
  content.push('BT /F1 16 Tf 0.173 0.118 0.180 rg 195 758 Td (SMARTMART MARKET) Tj ET');
  // Subtitle: TAX INVOICE
  content.push('BT /F1 15 Tf 0.333 0.490 0.384 rg 242 725 Td (TAX INVOICE) Tj ET');

  // Billing To Metadata (Left)
  content.push('BT /F1 9 Tf 0.059 0.090 0.165 rg 40 690 Td (BILLING TO:) Tj ET');
  content.push(`BT /F2 9 Tf 0.278 0.333 0.412 rg 40 676 Td (Customer Mobile: ) Tj /F1 9 Tf 0.082 0.502 0.239 rg (${phoneDisplay}) Tj ET`);
  content.push(`BT /F2 9 Tf 0.278 0.333 0.412 rg 40 662 Td (Invoice No: #${bill.invoiceNumber}) Tj ET`);
  content.push(`BT /F2 9 Tf 0.278 0.333 0.412 rg 40 648 Td (Date: ${bill.date} - ${bill.time}) Tj ET`);
  content.push(`BT /F2 9 Tf 0.278 0.333 0.412 rg 40 634 Td (Cashier: ${bill.cashier.slice(0, 30)}) Tj ET`);

  // Store Metadata (Right)
  content.push('BT /F1 9 Tf 0.059 0.090 0.165 rg 380 690 Td (SMARTMART SUPERMARKET) Tj ET');
  content.push('BT /F2 9 Tf 0.278 0.333 0.412 rg 380 676 Td (Store ID: #SM-DL-8821) Tj ET');
  content.push('BT /F2 9 Tf 0.278 0.333 0.412 rg 380 662 Td (GSTIN: 07AAACG1829K1Z4) Tj ET');
  content.push('BT /F2 9 Tf 0.278 0.333 0.412 rg 380 648 Td (Helpdesk: +91 98765 00000) Tj ET');
  content.push('BT /F2 9 Tf 0.278 0.333 0.412 rg 380 634 Td (In-Store Billing Counter) Tj ET');

  // Items Table Header
  content.push('0.486 0.631 0.537 rg'); // #7ca189
  content.push('36 600 523 22 re f');
  content.push('BT /F1 9 Tf 1 1 1 rg 46 607 Td (PRODUCT) Tj 240 0 Td (PRICE) Tj 90 0 Td (QTY) Tj 90 0 Td (TOTAL) Tj ET');

  // Item Rows
  let curY = 580;
  bill.items.slice(0, 10).forEach((item) => {
    const lineTotal = item.product.price * item.quantity;
    const nameStr = item.product.name.slice(0, 32);

    content.push(`BT /F1 9 Tf 0.118 0.161 0.231 rg 46 ${curY} Td (${nameStr}) Tj ET`);
    content.push(`BT /F2 8 Tf 0.392 0.455 0.545 rg 46 ${curY - 10} Td (${item.product.unit}) Tj ET`);
    content.push(`BT /F2 9 Tf 0.200 0.255 0.333 rg 286 ${curY} Td (Rs.${item.product.price}) Tj ET`);
    content.push(`BT /F1 9 Tf 0.118 0.161 0.231 rg 382 ${curY} Td (${item.quantity}) Tj ET`);
    content.push(`BT /F1 9 Tf 0.059 0.090 0.165 rg 466 ${curY} Td (Rs.${lineTotal}) Tj ET`);

    // Divider line
    content.push('0.914 0.925 0.910 RG');
    content.push('0.5 w');
    content.push(`36 ${curY - 14} m 559 ${curY - 14} l S`);

    curY -= 26;
  });

  // Summary & Totals
  const summaryY = Math.max(curY - 20, 220);

  // Terms & Conditions (Left)
  content.push(`BT /F1 8.5 Tf 0.118 0.161 0.231 rg 40 ${summaryY} Td (TERMS & CONDITIONS:) Tj ET`);
  content.push(`BT /F2 8 Tf 0.392 0.455 0.545 rg 40 ${summaryY - 12} Td (Thank you for shopping at SmartMart!) Tj ET`);
  content.push(`BT /F2 8 Tf 0.392 0.455 0.545 rg 40 ${summaryY - 23} Td (Retain this invoice for returns or exchanges within 7 days.) Tj ET`);

  // Totals (Right)
  if (bill.totalDiscount > 0) {
    content.push(`BT /F2 9 Tf 0.200 0.255 0.333 rg 380 ${summaryY} Td (Total MRP:) Tj 90 0 Td (Rs.${bill.totalMrp}) Tj ET`);
    content.push(`BT /F1 9 Tf 0.082 0.502 0.239 rg 380 ${summaryY - 14} Td (Store Discount:) Tj 90 0 Td (-Rs.${bill.totalDiscount}) Tj ET`);
  }
  content.push(`BT /F2 9 Tf 0.200 0.255 0.333 rg 380 ${summaryY - 28} Td (Subtotal:) Tj 90 0 Td (Rs.${bill.subtotal}) Tj ET`);
  content.push(`BT /F2 9 Tf 0.200 0.255 0.333 rg 380 ${summaryY - 42} Td (GST / Tax (5%):) Tj 90 0 Td (+Rs.${bill.tax}) Tj ET`);

  // Grand Total line
  content.push('0.169 0.333 0.243 RG 1.5 w');
  content.push(`380 ${summaryY - 48} m 540 ${summaryY - 48} l S`);
  content.push(`BT /F1 12 Tf 0.059 0.090 0.165 rg 380 ${summaryY - 64} Td (GRAND TOTAL:) Tj 80 0 Td (Rs.${bill.grandTotal}) Tj ET`);
  content.push(`BT /F1 9 Tf 0.082 0.502 0.239 rg 380 ${summaryY - 78} Td (PAID VIA ${bill.paymentMode}) Tj ET`);

  // Bottom Illustration Banner
  content.push('0.922 0.894 0.847 rg'); // #ebe4d8
  content.push('18 18 559 40 re f');
  content.push('BT /F1 8.5 Tf 0.420 0.447 0.502 rg 190 32 Td (SmartMart Kirana & Supermarket - Fresh Produce) Tj ET');

  content.push('Q');

  const stream = content.join('\n');
  const streamLen = stream.length;

  return [
    '%PDF-1.4',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >> endobj',
    `4 0 obj << /Length ${streamLen} >> stream\n${stream}\nendstream\nendobj`,
    'xref',
    '0 5',
    '0000000000 65535 f ',
    '0000000010 00000 n ',
    '0000000060 00000 n ',
    '0000000117 00000 n ',
    '0000000312 00000 n ',
    'trailer << /Size 5 /Root 1 0 R >>',
    'startxref',
    '400',
    '%%EOF',
  ].join('\n');
}

/**
 * Returns the standardized document file name for the invoice.
 */
export function generateInvoiceFileName(bill: InvoiceBillData): string {
  return `SmartMart_Invoice_${bill.invoiceNumber}.pdf`;
}

/**
 * Pure TypeScript Base64 encoder that safely supports UTF-8 / binary across all JS / React Native runtimes.
 */
export function encodeBase64(input: string): string {
  const globalObj = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;
  if (globalObj && typeof globalObj.Buffer !== 'undefined') {
    return globalObj.Buffer.from(input, 'utf-8').toString('base64');
  }

  // Safe UTF-8 byte conversion fallback
  const utf8Str = unescape(encodeURIComponent(input));
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';

  for (
    let block = 0, charCode, i = 0, map = chars;
    utf8Str.charAt(i | 0) || (map = '=', i % 1);
    output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))
  ) {
    charCode = utf8Str.charCodeAt((i += 3 / 4));
    block = (block << 8) | charCode;
  }
  return output;
}

/**
 * Generates a base64-encoded PDF data URI ready for attachment, webview, or native sharing.
 */
export function generateInvoicePdfDataUri(bill: InvoiceBillData): string {
  const pdfString = generateInvoicePdf(bill);
  const base64 = encodeBase64(pdfString);
  return `data:application/pdf;base64,${base64}`;
}

/**
 * Formats a concise, official SMS / Text Message containing the invoice doc details for the client.
 */
export function generateInvoiceSmsMessage(bill: InvoiceBillData): string {
  const cleanPhone = bill.customerPhone.replace(/\D/g, '');
  const savingsText = bill.totalDiscount > 0 ? ` (You saved Rs.${bill.totalDiscount}!)` : '';
  return `SmartMart Supermarket: Tax Invoice #${bill.invoiceNumber} for +91 ${cleanPhone}. Total: Rs.${bill.grandTotal} (${bill.paymentMode}).${savingsText} Retain this invoice for returns within 7 days. Thank you for shopping with us!`;
}

/**
 * Creates the formatted WhatsApp Tax Invoice message styled like the visual local market bill.
 * Uses WhatsApp monospace code-block formatting (``` ... ```) so box borders, headers,
 * and table columns render with clean fixed-width alignment matching the on-screen invoice.
 */
export function generateInvoiceWhatsAppMessage(bill: InvoiceBillData): string {
  const cleanPhone = (bill.customerPhone || '').replace(/\D/g, '');
  const WIDTH = 44; // inner width between ║ and ║

  const pad = (str: any, len: number, align: 'left' | 'right' = 'left'): string => {
    const s = String(str ?? '');
    if (s.length > len) return s.slice(0, len - 1) + '.';
    const spaces = ' '.repeat(Math.max(0, len - s.length));
    return align === 'right' ? spaces + s : s + spaces;
  };

  const center = (str: any, len: number): string => {
    const s = String(str ?? '');
    if (s.length > len) return s.slice(0, len - 1) + '.';
    const totalSpaces = len - s.length;
    const left = Math.floor(totalSpaces / 2);
    const right = totalSpaces - left;
    return ' '.repeat(left) + s + ' '.repeat(right);
  };

  const line = (content: string): string => '║' + pad(content, WIDTH) + '║';

  const twoCol = (left: string, right: string): string => {
    const leftLen = 24;
    const rightLen = WIDTH - leftLen;
    return '║' + pad(left, leftLen) + pad(right, rightLen, 'right') + '║';
  };

  const topBorder = '╔' + '═'.repeat(WIDTH) + '╗';
  const midBorder = '╠' + '═'.repeat(WIDTH) + '╣';
  const botBorder = '╚' + '═'.repeat(WIDTH) + '╝';

  const lines: string[] = [];
  lines.push('```');
  lines.push(topBorder);
  lines.push(line(center('SMARTMART MARKET - TAX INVOICE DOC', WIDTH)));
  lines.push(midBorder);
  lines.push(twoCol(' BILLING TO:', 'SMARTMART '));
  lines.push(twoCol(` +91 ${cleanPhone}`, 'SUPERMARKET '));
  lines.push(twoCol(` Inv: #${bill.invoiceNumber}`, 'Store: #SM-DL-8821 '));
  lines.push(twoCol(` Date: ${bill.date}`, 'GST: 07AAACG1829K '));
  lines.push(twoCol(` Time: ${bill.time}`, 'Ph: +91 98765 0000 '));
  lines.push(midBorder);
  lines.push('║ ' + pad('PRODUCT', 24) + pad('PRICE', 6, 'right') + pad('QTY', 4, 'right') + pad('TOTAL', 8, 'right') + ' ║');
  lines.push(midBorder);

  for (const item of bill.items) {
    const lineTotal = `₹${item.product.price * item.quantity}`;
    const price = `₹${item.product.price}`;
    if (item.product.name.length > 24) {
      lines.push(line(' ' + item.product.name));
      lines.push(line(pad('', 24) + pad(price, 6, 'right') + pad(item.quantity, 4, 'right') + pad(lineTotal, 8, 'right') + ' '));
    } else {
      lines.push('║ ' + pad(item.product.name, 24) + pad(price, 6, 'right') + pad(item.quantity, 4, 'right') + pad(lineTotal, 8, 'right') + ' ║');
    }
    if (item.product.mrp && item.product.mrp > item.product.price) {
      const saveAmt = (item.product.mrp - item.product.price) * item.quantity;
      lines.push(line(`  ${item.product.unit || 'Item'} [Save ₹${saveAmt}]`));
    }
  }

  lines.push(midBorder);
  lines.push(twoCol(' TOTAL MRP:', `₹${bill.totalMrp} `));
  if (bill.totalDiscount > 0) {
    lines.push(twoCol(' STORE DISCOUNT:', `-₹${bill.totalDiscount} `));
  }
  lines.push(twoCol(' SUB TOTAL:', `₹${bill.subtotal} `));
  lines.push(twoCol(' TAX (5% GST):', `+₹${bill.tax} `));
  lines.push(midBorder);
  lines.push(twoCol(' TOTAL PAID:', `₹${bill.grandTotal} `));
  const paymentTag = bill.paymentMode === 'CASH' && bill.cashTendered
    ? `CASH [₹${bill.cashTendered}]`
    : bill.paymentMode;
  lines.push(twoCol(` PAID VIA ${paymentTag}`, 'PAID ✅ '));
  lines.push(midBorder);
  lines.push(line(' TERMS & CONDITIONS:'));
  lines.push(line(' Thank you for shopping at SmartMart!'));
  lines.push(line(' Retain digital invoice for 7 days.'));
  lines.push(line(' Paperless Digital Tax Invoice'));
  lines.push(botBorder);
  lines.push('```');

  return lines.join('\n');
}
