import { buildInvoiceHtml, buildWhatsAppInvoiceMessage, createInvoicePdf, escapeHtml, formatPhoneNumber } from './invoicePdf';
import { generatePDF } from 'react-native-html-to-pdf';

jest.mock('react-native-html-to-pdf', () => ({
  __esModule: true,
  generatePDF: jest.fn().mockResolvedValue({
    filePath: '/var/mobile/Containers/Data/Application/SmartMart_Invoice_INV-463197.pdf',
  }),
}));

describe('invoicePdf Utility', () => {
  const sampleInvoice = {
    invoiceNumber: 'INV-463197',
    date: '28 Oct 2026',
    time: '4:41 PM',
    cashier: 'Rahul Sharma (Store Manager)',
    customerPhone: '9879091192',
    items: [
      {
        product: {
          id: '1',
          name: 'Amul Taaza Toned Milk',
          price: 54,
          mrp: 58,
          unit: '1L',
        },
        quantity: 2,
      },
      {
        product: {
          id: '5',
          name: 'Maggi 2-Minute Masala Noodles',
          price: 14,
          mrp: 16,
          unit: '70g',
        },
        quantity: 3,
      },
    ],
    totalMrp: 164,
    totalDiscount: 14,
    subtotal: 150,
    tax: 8,
    grandTotal: 158,
    paymentMode: 'CARD',
  };

  it('escapes dynamic string content safely', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('formats customer phone numbers for bill headers', () => {
    expect(formatPhoneNumber('9879091192')).toBe('+91 98790 91192');
    expect(formatPhoneNumber('')).toBe('N/A');
  });

  it('builds an A4 HTML document matching the design specs', () => {
    const html = buildInvoiceHtml(sampleInvoice);

    // Header styling
    expect(html).toContain('SMARTMART MARKET');
    expect(html).toContain('TAX INVOICE');
    expect(html).toContain('#2D5A43');
    expect(html).toContain('#FAF7F2');

    // Customer & store metadata
    expect(html).toContain('+91 98790 91192');
    expect(html).toContain('INV-463197');
    expect(html).toContain('Rahul Sharma (Store Manager)');
    expect(html).toContain('SMARTMART SUPERMARKET');
    expect(html).toContain('07AAACG1829K1Z4');

    // Items table with rupee symbols and savings
    expect(html).toContain('Amul Taaza Toned Milk');
    expect(html).toContain('Save ₹8');
    expect(html).toContain('Maggi 2-Minute Masala Noodles');
    expect(html).toContain('Save ₹6');
    expect(html).toContain('₹54');
    expect(html).toContain('₹58');

    // Totals block with actual payment mode (CARD, not hardcoded CASH)
    expect(html).toContain('TOTAL MRP:');
    expect(html).toContain('₹164');
    expect(html).toContain('STORE DISCOUNT:');
    expect(html).toContain('-₹14');
    expect(html).toContain('TOTAL:');
    expect(html).toContain('₹158');
    expect(html).toContain('PAID VIA CARD');
  });

  it('creates an offline PDF file via react-native-html-to-pdf', async () => {
    const pdfPath = await createInvoicePdf(sampleInvoice);

    expect(generatePDF).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'SmartMart_Invoice_INV-463197',
        directory: 'Documents',
      })
    );
    expect(pdfPath).toBe(
      'file:///var/mobile/Containers/Data/Application/SmartMart_Invoice_INV-463197.pdf'
    );
  });

  it('builds a clean text message for direct WhatsApp targeting', () => {
    const message = buildWhatsAppInvoiceMessage(sampleInvoice);

    expect(message).toContain('SMARTMART MARKET - TAX INVOICE');
    expect(message).toContain('+91 98790 91192');
    expect(message).toContain('Amul Taaza Toned Milk');
    expect(message).toContain('Maggi 2-Minute Masala Noodles');
    expect(message).toContain('TOTAL PAID: ₹158');
    expect(message).toContain('PAID VIA CARD');
    expect(message).not.toContain('smartmart.in');
    expect(message).not.toContain('http');
    // Ensure no broken ASCII box lines
    expect(message).not.toContain('╔');
    expect(message).not.toContain('╚');
    expect(message).not.toContain('║');
  });
});

