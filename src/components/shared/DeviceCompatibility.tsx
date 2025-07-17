import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

export default function DeviceCompatibility() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Works on All Your Devices
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access your notary business tools anywhere, anytime. Seamlessly sync across 
            all your devices with responsive design and offline capabilities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-white w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
              <Monitor className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Desktop & Laptop</h3>
            <p className="text-gray-600">Full-featured experience optimized for productivity and detailed work</p>
          </div>
          <div className="text-center">
            <div className="bg-white w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
              <Tablet className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Tablet</h3>
            <p className="text-gray-600">Touch-optimized interface perfect for client meetings and on-the-go work</p>
          </div>
          <div className="text-center">
            <div className="bg-white w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
              <Smartphone className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile Phone</h3>
            <p className="text-gray-600">Native iOS and Android apps with offline sync and push notifications</p>
          </div>
        </div>
      </div>
    </section>
  );
}