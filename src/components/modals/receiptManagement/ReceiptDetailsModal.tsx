import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ReceiptData } from './types';

interface ReceiptDetailsModalProps {
  receipt: ReceiptData;
  onClose: () => void;
}

export default function ReceiptDetailsModal({ receipt, onClose }: ReceiptDetailsModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-screen overflow-y-auto p-6 relative shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Receipt Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          {receipt.imageUrl && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Image</label>
              <img
                src={receipt.imageUrl}
                alt="Receipt"
                onClick={() => setIsZoomed(true)}
                className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-zoom-in hover:opacity-90"
              />
              <p className="text-xs text-gray-500 mt-1">Click to enlarge</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vendor</label>
                <p className="text-gray-900">{receipt.vendor}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="text-2xl font-bold text-green-600">${receipt.amount?.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <p className="text-gray-900">{receipt.date}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="text-gray-900">{receipt.category}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <p className="text-gray-900">{receipt.paymentMethod}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  receipt.status === 'processed'
                    ? 'bg-green-100 text-green-800'
                    : receipt.status === 'pending'
                    ? 'bg-orange-100 text-orange-800'
                    : receipt.status === 'approved'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {receipt.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tax Deductible</label>
                <p className="text-gray-900">{receipt.taxDeductible ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">OCR Processed</label>
                <p className="text-gray-900">{receipt.ocrProcessed ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <p className="text-gray-900">{receipt.description}</p>
          </div>

          {receipt.notes && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <p className="text-gray-900">{receipt.notes}</p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {isZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={receipt.imageUrl}
            alt="Zoomed Receipt"
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        </div>
      )}
    </>
  );
}

// import React, { useState } from 'react';
// import { X } from 'lucide-react';
// import { ReceiptData } from './types';

// interface ReceiptDetailsModalProps {
//   receipt: ReceiptData;
//   onClose: () => void;
// }

// export default function ReceiptDetailsModal({ receipt, onClose }: ReceiptDetailsModalProps) {
//   const [isZoomed, setIsZoomed] = useState(false);

//   const handleImageClick = () => {
//     setIsZoomed(true);
//   };

//   const handleZoomClose = () => {
//     setIsZoomed(false);
//   };

//   return (
//     <>
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative">
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-xl font-semibold text-gray-900">Receipt Details</h3>
//             <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
//               <X className="h-6 w-6" />
//             </button>
//           </div>

//           {receipt.imageUrl && (
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Image</label>
//               <img
//                 src={receipt.imageUrl}
//                 alt="Receipt"
//                 onClick={handleImageClick}
//                 className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-zoom-in hover:opacity-90"
//               />
//               <p className="text-xs text-gray-500 mt-1">Click to enlarge</p>
//             </div>
//           )}

//           {/* Rest of the details */}
//           <div className="grid md:grid-cols-2 gap-6">
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Vendor</label>
//                 <p className="text-gray-900">{receipt.vendor}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Amount</label>
//                 <p className="text-2xl font-bold text-green-600">${receipt.amount?.toFixed(2)}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Date</label>
//                 <p className="text-gray-900">{receipt.date}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Category</label>
//                 <p className="text-gray-900">{receipt.category}</p>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Payment Method</label>
//                 <p className="text-gray-900">{receipt.paymentMethod}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Status</label>
//                 <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
//                   receipt.status === 'processed'
//                     ? 'bg-green-100 text-green-800'
//                     : receipt.status === 'pending'
//                     ? 'bg-orange-100 text-orange-800'
//                     : receipt.status === 'approved'
//                     ? 'bg-blue-100 text-blue-800'
//                     : 'bg-red-100 text-red-800'
//                 }`}>
//                   {receipt.status}
//                 </span>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Tax Deductible</label>
//                 <p className="text-gray-900">{receipt.taxDeductible ? 'Yes' : 'No'}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">OCR Processed</label>
//                 <p className="text-gray-900">{receipt.ocrProcessed ? 'Yes' : 'No'}</p>
//               </div>
//             </div>
//           </div>

//           <div className="mt-6">
//             <label className="block text-sm font-medium text-gray-700">Description</label>
//             <p className="text-gray-900">{receipt.description}</p>
//           </div>

//           {receipt.notes && (
//             <div className="mt-4">
//               <label className="block text-sm font-medium text-gray-700">Notes</label>
//               <p className="text-gray-900">{receipt.notes}</p>
//             </div>
//           )}

//           <div className="mt-6 pt-4 border-t border-gray-200">
//             <button
//               onClick={onClose}
//               className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>

//       {isZoomed && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
//           <button
//             onClick={handleZoomClose}
//             className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
//           >
//             <X className="h-8 w-8" />
//           </button>
//           <img
//             src={receipt.imageUrl}
//             alt="Zoomed Receipt"
//             className="max-w-full max-h-full rounded-lg shadow-lg"
//           />
//         </div>
//       )}
//     </>
//   );
// }

// // import React from 'react';
// // import { X } from 'lucide-react';
// // import { ReceiptData } from './types';

// // interface ReceiptDetailsModalProps {
// //   receipt: ReceiptData;
// //   onClose: () => void;
// // }

// // export default function ReceiptDetailsModal({ receipt, onClose }: ReceiptDetailsModalProps) {
// //   return (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
// //       <div className="bg-white rounded-xl max-w-2xl w-full p-6">
// //         <div className="flex justify-between items-center mb-6">
// //           <h3 className="text-xl font-semibold text-gray-900">Receipt Details</h3>
// //           <button
// //             onClick={onClose}
// //             className="text-gray-400 hover:text-gray-600"
// //           >
// //             <X className="h-6 w-6" />
// //           </button>
// //         </div>
        
// //         {receipt.imageUrl && (
// //           <div className="mb-6">
// //             <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Image</label>
// //             <img
// //               src={receipt.imageUrl}
// //               alt="Receipt"
// //               className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
// //             />
// //           </div>
// //         )}
        
// //         <div className="grid md:grid-cols-2 gap-6">
// //           <div className="space-y-4">
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700">Vendor</label>
// //               <p className="text-gray-900">{receipt.vendor}</p>
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700">Amount</label>
// //               <p className="text-2xl font-bold text-green-600">${receipt.amount?.toFixed(2)}</p>
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700">Date</label>
// //               <p className="text-gray-900">{receipt.date}</p>
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700">Category</label>
// //               <p className="text-gray-900">{receipt.category}</p>
// //             </div>
// //           </div>
          
// //           <div className="space-y-4">
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700">Payment Method</label>
// //               <p className="text-gray-900">{receipt.paymentMethod}</p>
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700">Status</label>
// //               <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
// //                 receipt.status === 'processed' 
// //                   ? 'bg-green-100 text-green-800'
// //                   : receipt.status === 'pending'
// //                   ? 'bg-orange-100 text-orange-800'
// //                   : receipt.status === 'approved'
// //                   ? 'bg-blue-100 text-blue-800'
// //                   : 'bg-red-100 text-red-800'
// //               }`}>
// //                 {receipt.status}
// //               </span>
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700">Tax Deductible</label>
// //               <p className="text-gray-900">{receipt.taxDeductible ? 'Yes' : 'No'}</p>
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700">OCR Processed</label>
// //               <p className="text-gray-900">{receipt.ocrProcessed ? 'Yes' : 'No'}</p>
// //             </div>
// //           </div>
// //         </div>
        
// //         <div className="mt-6">
// //           <label className="block text-sm font-medium text-gray-700">Description</label>
// //           <p className="text-gray-900">{receipt.description}</p>
// //         </div>
        
// //         {receipt.notes && (
// //           <div className="mt-4">
// //             <label className="block text-sm font-medium text-gray-700">Notes</label>
// //             <p className="text-gray-900">{receipt.notes}</p>
// //           </div>
// //         )}
        
// //         <div className="mt-6 pt-4 border-t border-gray-200">
// //           <button
// //             onClick={onClose}
// //             className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
// //           >
// //             Close
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
