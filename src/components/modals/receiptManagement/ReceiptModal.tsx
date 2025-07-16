import React, { useState } from 'react';
import { X, Upload, Camera } from 'lucide-react';

interface ReceiptModalProps {
  receipt?: any;
  onSave: (receipt: any) => void;
  onCancel: () => void;
  title: string;
  categories: string[];
  ocrResult?: any;
  imageUrl?: string;
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ReceiptModal({
  receipt,
  onSave,
  onCancel,
  title,
  categories,
  ocrResult,
  imageUrl,
  onFileUpload,
}: ReceiptModalProps) {
  const [formData, setFormData] = useState({
    vendor: receipt?.vendor || ocrResult?.vendor || '',
    amount: receipt?.amount || ocrResult?.amount || 0,
    date: receipt?.date || ocrResult?.date || new Date().toISOString().split('T')[0],
    category: receipt?.category || ocrResult?.category || '',
    description: receipt?.description || ocrResult?.description || '',
    paymentMethod: receipt?.paymentMethod || ocrResult?.paymentMethod || 'Credit Card',
    taxDeductible: receipt?.taxDeductible ?? true,
    status: receipt?.status || 'pending',
    notes: receipt?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (receipt) {
      onSave({ ...receipt, ...formData, imageUrl: imageUrl || receipt.imageUrl });
    } else {
      onSave({ ...formData, imageUrl });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onFileUpload) {
      onFileUpload(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Section */}
          {(imageUrl || receipt?.imageUrl) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Image</label>
              <img
                src={imageUrl || receipt?.imageUrl}
                alt="Receipt"
                className="w-full max-h-48 object-contain rounded-lg border border-gray-200"
              />
            </div>
          )}

          {!imageUrl && !receipt?.imageUrl && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Receipt Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Upload receipt image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="receipt-upload"
                />
                <label
                  htmlFor="receipt-upload"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer inline-block"
                >
                  Choose File
                </label>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="taxDeductible"
              checked={formData.taxDeductible}
              onChange={(e) => setFormData(prev => ({ ...prev, taxDeductible: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="taxDeductible" className="ml-2 block text-sm text-gray-900">
              Tax Deductible
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
              Save Receipt
            </button>
            <button type="button" onClick={onCancel} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// import React, { useState } from 'react';
// import { X, Upload, Camera } from 'lucide-react';

// interface ReceiptModalProps {
//   receipt?: any;
//   onSave: (receipt: any) => void;
//   onCancel: () => void;
//   title: string;
//   categories: string[];
//   ocrResult?: any;
//   imageUrl?: string;
//   onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
// }

// export default function ReceiptModal({
//   receipt,
//   onSave,
//   onCancel,
//   title,
//   categories,
//   ocrResult,
//   imageUrl,
//   onFileUpload,
// }: ReceiptModalProps) {
//   const [formData, setFormData] = useState({
//     vendor: receipt?.vendor || ocrResult?.vendor || '',
//     amount: receipt?.amount || ocrResult?.amount || 0,
//     date: receipt?.date || ocrResult?.date || new Date().toISOString().split('T')[0],
//     category: receipt?.category || '',
//     description: receipt?.description || ocrResult?.description || '',
//     paymentMethod: receipt?.paymentMethod || 'Credit Card',
//     taxDeductible: receipt?.taxDeductible ?? true,
//     status: receipt?.status || 'pending',
//     notes: receipt?.notes || '',
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (receipt) {
//       onSave({ ...receipt, ...formData, imageUrl: imageUrl || receipt.imageUrl });
//     } else {
//       onSave({ ...formData, imageUrl });
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (onFileUpload) {
//       onFileUpload(e);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
//           <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
//             <X className="h-6 w-6" />
//           </button>
//         </div>

//         <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Image Upload Section */}
//           {(imageUrl || receipt?.imageUrl) && (
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Image</label>
//               <img
//                 src={imageUrl || receipt?.imageUrl}
//                 alt="Receipt"
//                 className="w-full max-h-48 object-contain rounded-lg border border-gray-200"
//               />
//             </div>
//           )}

//           {!imageUrl && !receipt?.imageUrl && (
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Add Receipt Image</label>
//               <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//                 <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
//                 <p className="text-gray-600 mb-2">Upload receipt image</p>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className="hidden"
//                   id="receipt-upload"
//                 />
//                 <label
//                   htmlFor="receipt-upload"
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer inline-block"
//                 >
//                   Choose File
//                 </label>
//               </div>
//             </div>
//           )}

//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
//               <input
//                 type="text"
//                 value={formData.vendor}
//                 onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={formData.amount}
//                 onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               />
//             </div>
//           </div>

//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//               <input
//                 type="date"
//                 value={formData.date}
//                 onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//               <select
//                 value={formData.category}
//                 onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               >
//                 <option value="">Select Category</option>
//                 {categories.map(category => (
//                   <option key={category} value={category}>{category}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//             <input
//               type="text"
//               value={formData.description}
//               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               required
//             />
//           </div>

//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
//               <select
//                 value={formData.paymentMethod}
//                 onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="Credit Card">Credit Card</option>
//                 <option value="Debit Card">Debit Card</option>
//                 <option value="Cash">Cash</option>
//                 <option value="Check">Check</option>
//                 <option value="Bank Transfer">Bank Transfer</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//               <select
//                 value={formData.status}
//                 onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="pending">Pending</option>
//                 <option value="processed">Processed</option>
//                 <option value="approved">Approved</option>
//                 <option value="rejected">Rejected</option>
//               </select>
//             </div>
//           </div>

//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               id="taxDeductible"
//               checked={formData.taxDeductible}
//               onChange={(e) => setFormData(prev => ({ ...prev, taxDeductible: e.target.checked }))}
//               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//             />
//             <label htmlFor="taxDeductible" className="ml-2 block text-sm text-gray-900">
//               Tax Deductible
//             </label>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
//             <textarea
//               value={formData.notes}
//               onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               rows={3}
//               placeholder="Additional notes..."
//             />
//           </div>

//           <div className="flex space-x-3 pt-4">
//             <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
//               Save Receipt
//             </button>
//             <button type="button" onClick={onCancel} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors">
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }