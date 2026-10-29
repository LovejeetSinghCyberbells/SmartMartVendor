import {
  generateInvoiceHtml,
  generateInvoicePdf,
  generateInvoicePdfDataUri,
  generateInvoiceWhatsAppMessage,
  InvoiceBillData,
} from './InvoiceDocumentGenerator';

describe('InvoiceDocumentGenerator', () => {
  const sampleBill: InvoiceBillData = {
    invoiceNumber: 'INV-123456',
    date: '28 Oct 2026',
    time: '03:45 PM',
    cashier: 'Rahul Sharma (Cashier)',
    customerPhone: '9876543210',
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
          id: '2',
          name: 'Fortune Sunlite Refined Oil',
          price: 145,
          mrp: 165,
          unit: '1L',
        },
        quantity: 1,
      },
    ],
    totalMrp: 281,
    totalDiscount: 28,
    subtotal: 253,
    tax: 13,
    grandTotal: 266,
    paymentMode: 'CASH',
    cashTendered: 300,
    cashChange: 34,
  };

  it('generates a complete HTML5 invoice document styled like the local market template', () => {
    const html = generateInvoiceHtml(sampleBill);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('SMARTMART MARKET');
    expect(html).toContain('TAX INVOICE');
    expect(html).toContain('INV-123456');
    expect(html).toContain('+91 98765 43210');
    expect(html).toContain('Amul Taaza Toned Milk');
    expect(html).toContain('Fortune Sunlite Refined Oil');
    expect(html).toContain('STORE DISCOUNT:');
    expect(html).toContain('-₹28.00');
    expect(html).toContain('SUB TOTAL:');
    expect(html).toContain('TAX (5% GST):');
    expect(html).toContain('₹266.00');
    expect(html).toContain('PAID VIA CASH');
    expect(html).toContain('TERMS & CONDITIONS:');
  });

  it('generates a valid binary PDF-1.4 document string and data URI', () => {
    const pdf = generateInvoicePdf(sampleBill);

    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf.endsWith('%%EOF')).toBe(true);
    expect(pdf).toContain('/Type /Catalog');
    expect(pdf).toContain('/Type /Pages');
    expect(pdf).toContain('SMARTMART MARKET');
    expect(pdf).toContain('TAX INVOICE');
    expect(pdf).toContain('INV-123456');

    const dataUri = generateInvoicePdfDataUri(sampleBill);
    expect(dataUri.startsWith('data:application/pdf;base64,')).toBe(true);
  });

  it('generates a structured WhatsApp invoice document dispatch', () => {
    const msg = generateInvoiceWhatsAppMessage(sampleBill);

    expect(msg).toContain('SMARTMART MARKET - TAX INVOICE DOC');
    expect(msg).toContain('INV-123456');
    expect(msg).toContain('+91 9876543210');
    expect(msg).toContain('Amul Taaza Toned Milk');
    expect(msg).toContain('TOTAL PAID');
    expect(msg).toContain('PAID ✅');
  });
});

