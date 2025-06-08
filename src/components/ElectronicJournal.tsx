import React from 'react';
import { PenTool, Scan, FileText } from 'lucide-react';

export default function ElectronicJournal() {
  return (
    <section className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Integrated Electronic Journal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay compliant with state requirements using our built-in electronic journal 
            featuring signature capture and secure ID scanning capabilities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <PenTool className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Digital Signature Pad
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Capture signatures digitally with pressure-sensitive technology that meets legal standards.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="bg-orange-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <Scan className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              ID Scanning
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Quickly scan and verify client identification documents with OCR technology.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Automated Entries
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Automatically populate journal entries with client and document information.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}