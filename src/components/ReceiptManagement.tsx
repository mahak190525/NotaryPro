import React from 'react';
import { Upload, Link, Shield, Receipt } from 'lucide-react';

export default function ReceiptManagement() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Effortless Receipt Management
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Simply snap a photo or upload receipts directly from your phone. Our intelligent system 
              automatically extracts key information and links expenses to the right categories.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <Upload className="h-6 w-6 text-green-600 mr-3" />
                <span className="text-gray-700">Instant photo upload and processing</span>
              </div>
              <div className="flex items-center">
                <Link className="h-6 w-6 text-green-600 mr-3" />
                <span className="text-gray-700">Automatic expense categorization</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-green-600 mr-3" />
                <span className="text-gray-700">Secure cloud storage and backup</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Receipts</h3>
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Receipt className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Office Supplies</div>
                      <div className="text-xs text-gray-500">Staples - Today</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">$24.99</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Receipt className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Gas - Mileage</div>
                      <div className="text-xs text-gray-500">Shell - Yesterday</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">$45.20</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}