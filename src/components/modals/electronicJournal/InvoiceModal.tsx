import React, { useState } from 'react';
import { X, Printer, Send, Download, FileText } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  time: string;
  clientName: string;
  clientId: string;
  documentType: string;
  notaryFee: number;
  location: string;
  witnessRequired: boolean;
  witnessName?: string;
  idVerified: boolean;
  idType: string;
  idNumber: string;
  idExpiration: string;
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface InvoiceModalProps {
  entry: JournalEntry;
  onClose: () => void;
}

export default function InvoiceModal({ entry, onClose }: InvoiceModalProps) {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    businessName: 'Your Notary Business',
    businessAddress: '123 Business St\nCity, State 12345',
    businessPhone: '(555) 123-4567',
    businessEmail: 'contact@notarybusiness.com',
    clientEmail: '',
    additionalFees: [] as { description: string; amount: number }[],
    notes: 'Thank you for your business!'
  });

  const [showEmailForm, setShowEmailForm] = useState(false);

  const addAdditionalFee = () => {
    setInvoiceData(prev => ({
      ...prev,
      additionalFees: [...prev.additionalFees, { description: '', amount: 0 }]
    }));
  };

  const updateAdditionalFee = (index: number, field: 'description' | 'amount', value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      additionalFees: prev.additionalFees.map((fee, i) => 
        i === index ? { ...fee, [field]: value } : fee
      )
    }));
  };

  const removeAdditionalFee = (index: number) => {
    setInvoiceData(prev => ({
      ...prev,
      additionalFees: prev.additionalFees.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    const additionalTotal = invoiceData.additionalFees.reduce((sum, fee) => sum + fee.amount, 0);
    return entry.notaryFee + additionalTotal;
  };

  const generateInvoiceHTML = () => {
    const total = calculateTotal();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .business-info { text-align: left; }
          .invoice-info { text-align: right; }
          .client-info { margin-bottom: 30px; }
          .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .invoice-table th { background-color: #f5f5f5; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
          .notes { margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="business-info">
            <h2>${invoiceData.businessName}</h2>
            <p>${invoiceData.businessAddress.replace(/\n/g, '<br>')}</p>
            <p>Phone: ${invoiceData.businessPhone}</p>
            <p>Email: ${invoiceData.businessEmail}</p>
          </div>
          <div class="invoice-info">
            <h1>INVOICE</h1>
            <p><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}</p>
            <p><strong>Date:</strong> ${invoiceData.issueDate}</p>
            <p><strong>Due Date:</strong> ${invoiceData.dueDate}</p>
          </div>
        </div>
        
        <div class="client-info">
          <h3>Bill To:</h3>
          <p><strong>${entry.clientName}</strong></p>
          <p>Service Date: ${entry.date} at ${entry.time}</p>
          <p>Location: ${entry.location}</p>
        </div>
        
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Document Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Notary Services</td>
              <td>${entry.documentType}</td>
              <td>$${entry.notaryFee.toFixed(2)}</td>
            </tr>
            ${invoiceData.additionalFees.map(fee => `
              <tr>
                <td>${fee.description}</td>
                <td>Additional Service</td>
                <td>$${fee.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2"><strong>Total Amount Due</strong></td>
              <td><strong>$${total.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        ${invoiceData.notes ? `
          <div class="notes">
            <h4>Notes:</h4>
            <p>${invoiceData.notes}</p>
          </div>
        ` : ''}
        
        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
          <p>Thank you for choosing our notary services!</p>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateInvoiceHTML());
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleDownload = () => {
    const htmlContent = generateInvoiceHTML();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceData.invoiceNumber}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = () => {
    if (!invoiceData.clientEmail) {
      alert('Please enter client email address');
      return;
    }
    
    // In a real implementation, this would send the email via your backend
    alert(`Invoice sent to ${invoiceData.clientEmail}`);
    setShowEmailForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Generate Invoice</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Business Information */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Business Information</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Business Name"
                value={invoiceData.businessName}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, businessName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="Business Address"
                value={invoiceData.businessAddress}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, businessAddress: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={invoiceData.businessPhone}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, businessPhone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={invoiceData.businessEmail}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, businessEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Invoice Details */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Invoice Details</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Invoice Number"
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                value={invoiceData.issueDate}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, issueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Service Details</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Client:</span> {entry.clientName}
              </div>
              <div>
                <span className="font-medium">Service Date:</span> {entry.date} at {entry.time}
              </div>
              <div>
                <span className="font-medium">Document:</span> {entry.documentType}
              </div>
              <div>
                <span className="font-medium">Location:</span> {entry.location}
              </div>
              <div>
                <span className="font-medium">Base Fee:</span> ${entry.notaryFee.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Fees */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-900">Additional Fees</h4>
            <button
              onClick={addAdditionalFee}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              Add Fee
            </button>
          </div>
          
          {invoiceData.additionalFees.map((fee, index) => (
            <div key={index} className="flex gap-3 mb-2">
              <input
                type="text"
                placeholder="Description"
                value={fee.description}
                onChange={(e) => updateAdditionalFee(index, 'description', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={fee.amount}
                onChange={(e) => updateAdditionalFee(index, 'amount', parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => removeAdditionalFee(index)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">Total Amount:</span>
            <span className="font-bold text-xl text-blue-600">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-900 mb-2">Notes</label>
          <textarea
            value={invoiceData.notes}
            onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows={3}
            placeholder="Additional notes or payment instructions..."
          />
        </div>

        {/* Email Form */}
        {showEmailForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Send Invoice via Email</h4>
            <input
              type="email"
              placeholder="Client Email Address"
              value={invoiceData.clientEmail}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, clientEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleSendEmail}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Send Email
              </button>
              <button
                onClick={() => setShowEmailForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
          <button
            onClick={() => setShowEmailForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
}