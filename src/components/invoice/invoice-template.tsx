import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { InvoicePayload } from '@/server/invoice-service';

// Register a font if needed, otherwise use default Helvetica
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111111',
  },
  companyInfo: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'right',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    color: '#111111',
  },
  addressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  addressBlock: {
    width: '45%',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#EEEEEE',
    marginTop: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#EEEEEE',
    backgroundColor: '#F9FAFB',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#EEEEEE',
    padding: 5,
  },
  tableCellHeader: {
    margin: 'auto',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
  },
  tableCell: {
    margin: 'auto',
    fontSize: 10,
    color: '#333333',
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 10,
    color: '#666666',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111111',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#999999',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
  },
});

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency }).format(amount);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(date));
};

export const InvoiceTemplate = ({ invoice }: { invoice: InvoicePayload }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.value}>#{invoice.orderNumber}</Text>
        </View>
        <View style={styles.companyInfo}>
          <Text>Meni Me India Store</Text>
          <Text>123 Fashion Street</Text>
          <Text>Mumbai, MH 400001</Text>
          <Text>India</Text>
          <Text>support@menime.in</Text>
        </View>
      </View>

      {/* Order Details */}
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Date Placed</Text>
          <Text style={styles.value}>{formatDate(invoice.placedAt)}</Text>
        </View>
        <View>
          <Text style={styles.label}>Customer</Text>
          <Text style={styles.value}>{invoice.customerName || 'Guest'}</Text>
          <Text style={styles.value}>{invoice.customerEmail}</Text>
        </View>
      </View>

      {/* Addresses */}
      <View style={styles.addressSection}>
        <View style={styles.addressBlock}>
          <Text style={[styles.label, { marginBottom: 5, fontWeight: 'bold' }]}>Bill To:</Text>
          {invoice.billingAddress ? (
            <>
              <Text style={styles.value}>{invoice.billingAddress.fullName}</Text>
              <Text style={styles.value}>{invoice.billingAddress.streetLine1}</Text>
              {invoice.billingAddress.streetLine2 && <Text style={styles.value}>{invoice.billingAddress.streetLine2}</Text>}
              <Text style={styles.value}>
                {[invoice.billingAddress.city, invoice.billingAddress.state, invoice.billingAddress.postalCode]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
              <Text style={styles.value}>{invoice.billingAddress.country}</Text>
              {invoice.billingAddress.phoneNumber && <Text style={styles.value}>{invoice.billingAddress.phoneNumber}</Text>}
            </>
          ) : (
            <Text style={styles.value}>Same as shipping address</Text>
          )}
        </View>
        <View style={styles.addressBlock}>
          <Text style={[styles.label, { marginBottom: 5, fontWeight: 'bold' }]}>Ship To:</Text>
          {invoice.shippingAddress ? (
            <>
              <Text style={styles.value}>{invoice.shippingAddress.fullName}</Text>
              <Text style={styles.value}>{invoice.shippingAddress.streetLine1}</Text>
              {invoice.shippingAddress.streetLine2 && <Text style={styles.value}>{invoice.shippingAddress.streetLine2}</Text>}
              <Text style={styles.value}>
                {[invoice.shippingAddress.city, invoice.shippingAddress.state, invoice.shippingAddress.postalCode]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
              <Text style={styles.value}>{invoice.shippingAddress.country}</Text>
              {invoice.shippingAddress.phoneNumber && <Text style={styles.value}>{invoice.shippingAddress.phoneNumber}</Text>}
            </>
          ) : (
            <Text style={styles.value}>No shipping address provided</Text>
          )}
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={[styles.tableColHeader, { width: '40%' }]}>
            <Text style={styles.tableCellHeader}>Item</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '20%' }]}>
            <Text style={styles.tableCellHeader}>Quantity</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '20%' }]}>
            <Text style={styles.tableCellHeader}>Price</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '20%' }]}>
            <Text style={styles.tableCellHeader}>Total</Text>
          </View>
        </View>
        {invoice.items.map((item) => (
          <View style={styles.tableRow} key={item.id}>
            <View style={[styles.tableCol, { width: '40%' }]}>
              <Text style={styles.tableCell}>{item.productName}</Text>
              {(item.selectedSize || item.selectedColor) && (
                <Text style={[styles.tableCell, { fontSize: 8, color: '#666' }]}>
                  {[item.selectedSize && `Size: ${item.selectedSize}`, item.selectedColor && `Color: ${item.selectedColor}`]
                    .filter(Boolean)
                    .join(' | ')}
                </Text>
              )}
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}>{item.quantity}</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}>{formatCurrency(item.unitPrice, invoice.currency)}</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}>{formatCurrency(item.lineTotal, invoice.currency)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.value}>{formatCurrency(invoice.subtotal, invoice.currency)}</Text>
        </View>
        {invoice.shippingFee !== null && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping:</Text>
            <Text style={styles.value}>{formatCurrency(invoice.shippingFee, invoice.currency)}</Text>
          </View>
        )}
        {invoice.tax !== null && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax:</Text>
            <Text style={styles.value}>{formatCurrency(invoice.tax, invoice.currency)}</Text>
          </View>
        )}
        <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: 5, marginTop: 5 }]}>
          <Text style={[styles.totalLabel, { fontSize: 12, fontWeight: 'bold', color: '#111' }]}>Total:</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice.total, invoice.currency)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Thank you for shopping with Meni Me India Store!</Text>
        <Text>For any questions, please contact support@menime.in</Text>
      </View>
    </Page>
  </Document>
);
