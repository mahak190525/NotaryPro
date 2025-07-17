import React, { useState } from 'react';
import { Calendar, Download, FileText, TrendingUp, DollarSign, Car } from 'lucide-react';

interface MileageData {
  month: string;
  businessMiles: number;
  personalMiles: number;
  totalDeduction: number;
  trips: number;
}

export default function MileageReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('2025');
  const [reportType, setReportType] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  const mileageData: MileageData[] = [
    { month: 'January 2025', businessMiles: 245.8, personalMiles: 89.2, totalDeduction: 164.69, trips: 18 },
    { month: 'December 2024', businessMiles: 198.4, personalMiles: 156.7, totalDeduction: 132.93, trips: 15 },
    { month: 'November 2024', businessMiles: 312.6, personalMiles: 78.9, totalDeduction: 209.44, trips: 22 },
    { month: 'October 2024', businessMiles: 267.3, personalMiles: 134.5, totalDeduction: 179.09, trips: 19 },
    { month: 'September 2024', businessMiles: 189.7, personalMiles: 201.3, totalDeduction: 127.10, trips: 14 },
    { month: 'August 2024', businessMiles: 298.1, personalMiles: 67.4, totalDeduction: 199.73, trips: 21 }
  ];

  const totalBusinessMiles = mileageData.reduce((sum, data) => sum + data.businessMiles, 0);
  const totalDeduction = mileageData.reduce((sum, data) => sum + data.totalDeduction, 0);
  const totalTrips = mileageData.reduce((sum, data) => sum + data.trips, 0);
  const averageMilesPerTrip = totalBusinessMiles / totalTrips;

  const exportReport = (format: 'pdf' | 'csv' | 'excel') => {
    // Create sample data for download
    const csvData = [
      ['Period', 'Business Miles', 'Personal Miles', 'Total Trips', 'Tax Deduction', 'Business %'],
      ...mileageData.map(data => {
        const totalMiles = data.businessMiles + data.personalMiles;
        const businessPercentage = (data.businessMiles / totalMiles) * 100;
        return [
          data.month,
          data.businessMiles.toFixed(1),
          data.personalMiles.toFixed(1),
          data.trips.toString(),
          `$${data.totalDeduction.toFixed(2)}`,
          `${businessPercentage.toFixed(1)}%`
        ];
      })
    ];

    if (format === 'csv') {
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `mileage-report-${reportType}-${selectedPeriod}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'excel') {
      // For Excel, we'll create a more detailed CSV that Excel can import
      const excelData = [
        ['Mileage Report - ' + reportType.charAt(0).toUpperCase() + reportType.slice(1)],
        ['Generated on: ' + new Date().toLocaleDateString()],
        ['Period: ' + selectedPeriod],
        [''],
        ['Summary'],
        ['Total Business Miles', totalBusinessMiles.toFixed(1)],
        ['Total Tax Deduction', `$${totalDeduction.toFixed(2)}`],
        ['Total Trips', totalTrips.toString()],
        ['Average Miles per Trip', averageMilesPerTrip.toFixed(1)],
        [''],
        ...csvData
      ];
      
      const csvContent = excelData.map(row => Array.isArray(row) ? row.join(',') : row).join('\n');
      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `mileage-report-${reportType}-${selectedPeriod}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      // For PDF, we'll create an HTML page that can be printed to PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Mileage Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; }
            .summary { background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Mileage Report - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Period: ${selectedPeriod}</p>
          
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Business Miles:</strong> ${totalBusinessMiles.toFixed(1)}</p>
            <p><strong>Total Tax Deduction:</strong> $${totalDeduction.toFixed(2)}</p>
            <p><strong>Total Trips:</strong> ${totalTrips}</p>
            <p><strong>Average Miles per Trip:</strong> ${averageMilesPerTrip.toFixed(1)}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                ${csvData[0].map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${csvData.slice(1).map(row => 
                `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        newWindow.onload = () => {
          setTimeout(() => {
            newWindow.print();
          }, 250);
        };
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mileage Reports</h1>
          <p className="text-gray-600">Generate detailed reports for tax filing and business analysis</p>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as 'monthly' | 'quarterly' | 'yearly')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => exportReport('pdf')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </button>
              <button
                onClick={() => exportReport('excel')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </button>
              <button
                onClick={() => exportReport('csv')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Business Miles</p>
                <p className="text-2xl font-bold text-blue-600">{totalBusinessMiles.toFixed(1)}</p>
              </div>
              <Car className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deduction</p>
                <p className="text-2xl font-bold text-green-600">${totalDeduction.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-purple-600">{totalTrips}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Miles/Trip</p>
                <p className="text-2xl font-bold text-orange-600">{averageMilesPerTrip.toFixed(1)}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Detailed Report Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Breakdown
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Miles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Miles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Trips</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Deduction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mileageData.map((data, index) => {
                  const totalMiles = data.businessMiles + data.personalMiles;
                  const businessPercentage = (data.businessMiles / totalMiles) * 100;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {data.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.businessMiles.toFixed(1)} mi
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.personalMiles.toFixed(1)} mi
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.trips}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${data.totalDeduction.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${businessPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{businessPercentage.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tax Summary */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Year Summary</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">${totalDeduction.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total Tax Deduction</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalBusinessMiles.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Business Miles Driven</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">$0.67</p>
              <p className="text-sm text-gray-600">IRS Standard Rate</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> This report is based on the IRS standard mileage rate of $0.67 per mile for 2025. 
              Keep detailed records of all business trips for tax filing purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}