import React from 'react';
import { DollarSign } from 'lucide-react';

export default function TaxSavingsSection() {
  return (
    <section className="py-20 bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          <DollarSign className="h-16 w-16 mx-auto mb-6 text-blue-200" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Maximize Your Tax Savings
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Our platform automatically categorizes expenses, tracks mileage, and organizes receipts 
            to ensure you capture every possible deduction. Users typically save $2,000-$5,000 annually.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-blue-200">Expense Tracking Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">$3,500</div>
              <div className="text-blue-200">Average Annual Tax Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-blue-200">IRS Compliant Reporting</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}