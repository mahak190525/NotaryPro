import React from 'react';
import { Smartphone, CheckCircle } from 'lucide-react';

export default function MobileApplication() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl text-white">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <Smartphone className="h-12 w-12 text-white mb-4" />
              <h3 className="text-xl font-semibold mb-4">NotaryPro Mobile</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Instant receipt capture</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>GPS mileage tracking</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Appointment notifications</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Client communication</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Free Mobile App
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Download our free mobile app for iOS and Android. Capture receipts, track mileage, 
              manage appointments, and stay connected with clients wherever your business takes you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center justify-center font-medium hover:bg-gray-800 transition-colors">
                <Smartphone className="h-5 w-5 mr-2" />
                Download for iOS
              </button>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center font-medium hover:bg-green-700 transition-colors">
                <Smartphone className="h-5 w-5 mr-2" />
                Download for Android
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}