import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Streamline Your
            <span className="text-blue-600 block">Notary Business</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            The complete management platform for modern notaries. Track expenses, manage appointments, 
            automate workflows, and maximize tax savings—all in one powerful solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="text-gray-600 hover:text-blue-600 px-8 py-4 text-lg font-medium transition-colors flex items-center">
              Watch Demo
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">No credit card required • 30-day free trial</p>
        </div>
      </div>
    </section>
  );
}