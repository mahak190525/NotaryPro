import React from 'react';
import { Shield, Lock, CheckCircle, Zap, ArrowRight } from 'lucide-react';

export default function PrivacySecurity() {
  return (
    <section id="security" className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Shield className="h-16 w-16 mx-auto mb-6 text-blue-400" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Bank-Level Security & Privacy
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Your sensitive business data is protected with enterprise-grade security measures 
            and privacy controls that exceed industry standards.
          </p>
          <button className="text-blue-400 hover:text-blue-300 font-medium flex items-center mx-auto transition-colors">
            Learn more about our security measures
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <Lock className="h-8 w-8 mx-auto mb-4 text-blue-400" />
            <h3 className="font-semibold mb-2">256-bit Encryption</h3>
            <p className="text-gray-400 text-sm">End-to-end encryption for all data transmission</p>
          </div>
          <div className="text-center">
            <Shield className="h-8 w-8 mx-auto mb-4 text-blue-400" />
            <h3 className="font-semibold mb-2">SOC 2 Compliant</h3>
            <p className="text-gray-400 text-sm">Independently audited security controls</p>
          </div>
          <div className="text-center">
            <Zap className="h-8 w-8 mx-auto mb-4 text-blue-400" />
            <h3 className="font-semibold mb-2">Regular Backups</h3>
            <p className="text-gray-400 text-sm">Automated daily backups with instant recovery</p>
          </div>
          <div className="text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-4 text-blue-400" />
            <h3 className="font-semibold mb-2">GDPR Ready</h3>
            <p className="text-gray-400 text-sm">Full compliance with privacy regulations</p>
          </div>
        </div>
      </div>
    </section>
  );
}