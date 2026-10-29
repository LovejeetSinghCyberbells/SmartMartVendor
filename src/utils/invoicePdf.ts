import { InvoiceBillData, generateInvoicePdfDataUri } from '../features/billing/utils/InvoiceDocumentGenerator';

export type { InvoiceBillData };

let cachedGeneratePDF: ((options: any) => Promise<any>) | null = null;
let hasCheckedHtmlToPdf = false;

function getGeneratePdfFn() {
  if (hasCheckedHtmlToPdf) return cachedGeneratePDF;
  hasCheckedHtmlToPdf = true;
  try {
    const mod = require('react-native-html-to-pdf');
    cachedGeneratePDF = mod.generatePDF || mod.default?.generatePDF || null;
  } catch (err) {
    console.warn('[InvoicePdf] react-native-html-to-pdf native module not linked yet in binary:', err);
  }
  return cachedGeneratePDF;
}

/**
 * Escapes unsafe HTML characters to prevent injection.
 */
export function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formats phone number for display (e.g. +91 98790 91192).
 */
export function formatPhoneNumber(phone: string): string {
  const clean = (phone || '').replace(/\D/g, '');
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return clean ? `+91 ${clean}` : 'N/A';
}

/**
 * Builds a clean, professional text invoice for WhatsApp chat
 * that opens directly in the customer's chat thread.
 */
export function buildWhatsAppInvoiceMessage(invoice: InvoiceBillData): string {
  const formattedPhone = formatPhoneNumber(invoice.customerPhone);
  const itemsText = (invoice.items || [])
    .map((item, idx) => {
      const lineTotal = item.product.price * item.quantity;
      const itemMrp = item.product.mrp;
      const hasDiscount = itemMrp && itemMrp > item.product.price;
      const savings = hasDiscount
        ? ` _(Save ₹${(itemMrp - item.product.price) * item.quantity})_`
        : '';
      return `${idx + 1}. *${item.product.name}* (${item.product.unit || 'Pack'})\n   ${item.quantity} x ₹${item.product.price} = *₹${lineTotal}*${savings}`;
    })
    .join('\n');

  const discountBlock =
    invoice.totalDiscount > 0
      ? `Total MRP: ₹${invoice.totalMrp}\nStore Discount: -₹${invoice.totalDiscount}\n`
      : '';

  const cashierStr = invoice.cashier ? `\nCashier: ${invoice.cashier}` : '';
  const dateStr = invoice.date ? `${invoice.date} • ${invoice.time || ''}` : '';

  return [
    `🧾 *SMARTMART MARKET - TAX INVOICE*`,
    `Invoice: *#${invoice.invoiceNumber}*`,
    `Customer: ${formattedPhone}`,
    `Date: ${dateStr}`,
    `Store: SMARTMART SUPERMARKET (#SM-DL-8821)`,
    `GSTIN: 07AAACG1829K1Z4${cashierStr}`,
    ``,
    `🛒 *PURCHASED ITEMS:*`,
    itemsText,
    ``,
    `--------------------------------`,
    `${discountBlock}Sub Total: ₹${invoice.subtotal}`,
    `Tax (5% GST): +₹${invoice.tax}`,
    `*TOTAL PAID: ₹${invoice.grandTotal}*`,
    `Status: *PAID VIA ${invoice.paymentMode || 'CASH'}*`,
    `--------------------------------`,
    ``,
    `🌿 _Thank you for shopping at SmartMart! Retain this digital invoice for 7 days._`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Builds a clean, single-page A4 HTML document matching the on-screen
 * dark green frame, cream card, ribbon header, two-column metadata,
 * product table, and financial summary.
 */
export function buildInvoiceHtml(invoice: InvoiceBillData): string {
  const formattedPhone = formatPhoneNumber(invoice.customerPhone);
  const paymentMode = escapeHtml(invoice.paymentMode || 'CASH');
  const invoiceNum = escapeHtml(invoice.invoiceNumber || '');
  const cashierName = escapeHtml(invoice.cashier || 'Store Associate');
  const dateStr = escapeHtml(invoice.date || '');
  const timeStr = escapeHtml(invoice.time || '');

  const hasDiscount = invoice.totalDiscount > 0;
  const hasCashChange =
    invoice.cashChange !== undefined &&
    invoice.cashChange > 0 &&
    invoice.paymentMode === 'CASH';

  const itemsRows = (invoice.items || [])
    .map((item, idx) => {
      const lineTotal = item.product.price * item.quantity;
      const itemMrp = item.product.mrp;
      const itemHasDiscount = itemMrp && itemMrp > item.product.price;
      const itemSavings = itemHasDiscount
        ? (itemMrp - item.product.price) * item.quantity
        : 0;

      const productName = escapeHtml(item.product.name);
      const unit = escapeHtml(item.product.unit || 'Pack');

      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 7px 8px; vertical-align: middle;">
            <div style="font-weight: 700; color: #111827; font-size: 13px; line-height: 1.2;">
              ${idx + 1}. ${productName}
            </div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
              <span>${unit}</span>
              ${
                itemHasDiscount
                  ? `<span style="background-color: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; margin-left: 6px;">Save ₹${itemSavings}</span>`
                  : ''
              }
            </div>
          </td>
          <td style="padding: 7px 8px; text-align: right; vertical-align: middle;">
            <div style="font-weight: 700; color: #111827; font-size: 13px;">₹${item.product.price}</div>
            ${
              itemHasDiscount
                ? `<div style="font-size: 10px; color: #9ca3af; text-decoration: line-through;">₹${itemMrp}</div>`
                : ''
            }
          </td>
          <td style="padding: 7px 8px; text-align: center; vertical-align: middle; font-weight: 700; color: #111827; font-size: 13px;">
            ${item.quantity}
          </td>
          <td style="padding: 7px 8px; text-align: right; vertical-align: middle; font-weight: 800; color: #111827; font-size: 13px;">
            ₹${lineTotal}
          </td>
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>SmartMart Invoice #${invoiceNum}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 6mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1f2937;
      font-size: 12px;
    }
    .outer-frame {
      border: 8px solid #2D5A43;
      border-radius: 16px;
      padding: 18px 22px;
      background-color: #FAF7F2;
      width: 100%;
      min-height: calc(100vh - 16mm);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .header-ribbon {
      text-align: center;
      margin-bottom: 14px;
    }
    .ribbon-banner {
      display: inline-block;
      background-color: #E8E0D2;
      color: #374151;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 2.5px;
      padding: 6px 28px;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      text-transform: uppercase;
    }
    .ribbon-subtitle {
      color: #2D5A43;
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 4px;
      margin-top: 6px;
      text-transform: uppercase;
    }
    .meta-table {
      width: 100%;
      margin-bottom: 14px;
      border-collapse: collapse;
    }
    .meta-col-left {
      width: 50%;
      vertical-align: top;
      padding-right: 12px;
      line-height: 1.5;
    }
    .meta-col-right {
      width: 50%;
      vertical-align: top;
      text-align: right;
      padding-left: 12px;
      line-height: 1.5;
    }
    .meta-section-title {
      font-size: 10px;
      font-weight: 800;
      color: #4b5563;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .meta-phone {
      font-size: 13px;
      font-weight: 800;
      color: #15803d;
      margin-bottom: 3px;
    }
    .meta-line {
      font-size: 11.5px;
      color: #4b5563;
    }
    .store-name-title {
      font-size: 12.5px;
      font-weight: 800;
      color: #111827;
      letter-spacing: 0.5px;
    }
    .product-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }
    .product-table th {
      background-color: #5B8266;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.8px;
      padding: 8px 8px;
      text-transform: uppercase;
    }
    .bottom-section {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    .terms-box {
      width: 48%;
      vertical-align: top;
      background-color: #f3eee4;
      border-radius: 8px;
      padding: 12px;
      line-height: 1.45;
    }
    .summary-box {
      width: 48%;
      vertical-align: top;
      padding-left: 20px;
      line-height: 1.5;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 12px;
      color: #4b5563;
    }
    .summary-row-bold {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 2px solid #2D5A43;
      font-size: 17px;
      font-weight: 900;
      color: #111827;
    }
    .paid-badge {
      display: inline-block;
      margin-top: 6px;
      background-color: #dcfce7;
      color: #15803d;
      font-size: 11.5px;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 12px;
      border: 1px solid #bbf7d0;
      text-align: right;
    }
    .footer-bar {
      border-top: 1px dashed #d1d5db;
      padding-top: 10px;
      text-align: center;
    }
    .veggie-badges {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 6px;
    }
    .veggie-pill {
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 12px;
    }
    .footer-tagline {
      font-size: 10.5px;
      color: #6b7280;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="outer-frame">
    <div>
      <!-- Header Ribbon -->
      <div class="header-ribbon">
        <div class="ribbon-banner">SMARTMART MARKET</div>
        <div class="ribbon-subtitle">TAX INVOICE</div>
      </div>

      <!-- Two-Column Billing Metadata -->
      <table class="meta-table">
        <tr>
          <td class="meta-col-left">
            <div class="meta-section-title">BILLING TO:</div>
            <div class="meta-phone">${formattedPhone}</div>
            <div class="meta-line">Invoice: <strong>#${invoiceNum}</strong></div>
            <div class="meta-line">Date: ${dateStr} • ${timeStr}</div>
            <div class="meta-line">Cashier: ${cashierName}</div>
          </td>
          <td class="meta-col-right">
            <div class="store-name-title">SMARTMART SUPERMARKET</div>
            <div class="meta-line">Store ID: #SM-DL-8821</div>
            <div class="meta-line">GSTIN: 07AAACG1829K1Z4</div>
            <div class="meta-line">Phone: +91 98765 00000</div>
            <div class="meta-line">In-Store Counter Billing</div>
          </td>
        </tr>
      </table>

      <!-- Product Table -->
      <table class="product-table">
        <thead>
          <tr>
            <th style="text-align: left; width: 50%;">PRODUCT</th>
            <th style="text-align: right; width: 18%;">PRICE</th>
            <th style="text-align: center; width: 12%;">QTY</th>
            <th style="text-align: right; width: 20%;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Bottom Two-Column: Terms & Totals -->
      <table class="bottom-section">
        <tr>
          <td class="terms-box">
            <div style="font-weight: 800; font-size: 11px; color: #374151; margin-bottom: 4px; text-transform: uppercase;">
              TERMS &amp; CONDITIONS:
            </div>
            <div style="font-size: 11px; color: #4b5563; margin-bottom: 8px;">
              Thank you for shopping at SmartMart! Retain this digital invoice for exchange or queries within 7 days.
            </div>
            <div style="display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px;">
              🌿 Paperless Digital Invoice
            </div>
          </td>
          <td class="summary-box">
            ${
              hasDiscount
                ? `
            <div class="summary-row">
              <span>TOTAL MRP:</span>
              <span style="font-weight: 600;">₹${invoice.totalMrp}</span>
            </div>
            <div class="summary-row">
              <span style="color: #16a34a; font-weight: 700;">STORE DISCOUNT:</span>
              <span style="color: #16a34a; font-weight: 700;">-₹${invoice.totalDiscount}</span>
            </div>
            `
                : ''
            }
            <div class="summary-row">
              <span>SUB TOTAL:</span>
              <span style="font-weight: 700;">₹${invoice.subtotal}</span>
            </div>
            <div class="summary-row">
              <span>TAX (5% GST):</span>
              <span style="font-weight: 700;">+₹${invoice.tax}</span>
            </div>
            <div class="summary-row-bold">
              <span>TOTAL:</span>
              <span>₹${invoice.grandTotal}</span>
            </div>
            <div style="text-align: right;">
              <div class="paid-badge">
                ✓ PAID VIA ${paymentMode}
              </div>
              ${
                hasCashChange
                  ? `<div style="font-size: 10.5px; color: #4b5563; margin-top: 3px;">Tendered: ₹${invoice.cashTendered} • Change: ₹${invoice.cashChange}</div>`
                  : ''
              }
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Bottom Market Illustration & Tagline -->
    <div class="footer-bar">
      <div class="veggie-badges">
        <span class="veggie-pill" style="background-color: #ffe4e6; color: #be123c;">🍅 Fresh</span>
        <span class="veggie-pill" style="background-color: #ffedd5; color: #c2410c;">🎃 Farm</span>
        <span class="veggie-pill" style="background-color: #dcfce7; color: #15803d;">🥬 Organic</span>
        <span class="veggie-pill" style="background-color: #fef3c7; color: #b45309;">🍉 Pure</span>
      </div>
      <div class="footer-tagline">
        SmartMart Kirana &amp; Supermarket • Fresh Produce &amp; Daily Grocery
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Converts an invoice data object to a physical PDF file on the device
 * named `SmartMart_Invoice_<invoiceId>.pdf` and returns the local file path or URI.
 */
export async function createInvoicePdf(invoice: InvoiceBillData): Promise<string> {
  const invoiceId = invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `SmartMart_Invoice_${invoiceId}`;
  const html = buildInvoiceHtml(invoice);

  const generatePDFFn = getGeneratePdfFn();
  if (typeof generatePDFFn === 'function') {
    try {
      const result = await generatePDFFn({
        html,
        fileName,
        directory: 'Documents',
        shouldPrintBackgrounds: true,
        bgColor: '#FAF7F2',
      });

      if (result && result.filePath) {
        const path = result.filePath.startsWith('file://')
          ? result.filePath
          : `file://${result.filePath}`;
        return path;
      }
    } catch (err) {
      console.warn('[InvoicePdf] generatePDF native call failed, falling back to data URI:', err);
    }
  }

  // Fallback if native module is unavailable (e.g. unlinked binary or mock environment)
  return generateInvoicePdfDataUri(invoice);
}
