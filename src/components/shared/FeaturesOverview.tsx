import React from 'react';
import { Calculator, FileText, Calendar, MapPin, Receipt, PenTool } from 'lucide-react';

export default function FeaturesOverview() {
  const features = [
    {
      icon: Calculator,
      title: "Smart Accounting",
      description: "Automated bookkeeping and financial tracking designed specifically for notary businesses"
    },
    {
      icon: FileText,
      title: "Professional Invoicing",
      description: "Create and send professional invoices with customizable templates and automated follow-ups"
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description: "Seamless calendar integration with client booking and automated reminders"
    },
    {
      icon: MapPin,
      title: "Mileage Tracking",
      description: "GPS-powered mileage logging for accurate business expense deductions"
    },
    {
      icon: Receipt,
      title: "Tax Reporting",
      description: "Comprehensive tax preparation tools with categorized expenses and deduction optimization"
    },
    {
      icon: PenTool,
      title: "Electronic Journal",
      description: "Digital notary journal with signature capture and secure document storage"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools designed specifically for notary professionals to manage, 
            track, and grow their business efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}