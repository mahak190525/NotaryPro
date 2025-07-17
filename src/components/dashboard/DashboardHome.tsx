import React from 'react';
import { useState } from 'react';
import { 
  Receipt, 
  PenTool, 
  Car, 
  BarChart3, 
  Zap, 
  Download,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Users,
  ArrowRight
} from 'lucide-react';
import ReceiptModal from '../modals/receiptManagement/ReceiptModal';
import JournalEntryModal from '../modals/electronicJournal/JournalEntryModal';

interface DashboardHomeProps {
  user: any;
  onNavigate: (page: string) => void;
}

export default function DashboardHome({ user, onNavigate }: DashboardHomeProps) {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);

  const quickStats = [
    { label: 'This Month Revenue', value: '$2,450', change: '+12%', icon: DollarSign, color: 'text-green-600' },
    { label: 'Appointments', value: '18', change: '+3', icon: Calendar, color: 'text-blue-600' },
    { label: 'Miles Tracked', value: '245.8', change: '+45.2', icon: Car, color: 'text-purple-600' },
    { label: 'Tax Deductions', value: '$1,890', change: '+$340', icon: TrendingUp, color: 'text-orange-600' }
  ];

  const recentActivity = [
    { type: 'appointment', title: 'Completed notarization for John Smith', time: '2 hours ago', icon: CheckCircle, color: 'text-green-600' },
    { type: 'receipt', title: 'Added receipt from Office Depot', time: '4 hours ago', icon: Receipt, color: 'text-blue-600' },
    { type: 'mileage', title: 'Tracked 12.5 miles to client meeting', time: '6 hours ago', icon: Car, color: 'text-purple-600' },
    { type: 'automation', title: 'Sent appointment reminder to Sarah Johnson', time: '1 day ago', icon: Zap, color: 'text-yellow-600' }
  ];

  const quickActions = [
    { title: 'Add Receipt', description: 'Capture a new business expense', icon: Receipt, action: 'receipt-modal', color: 'bg-blue-600' },
    { title: 'New Journal Entry', description: 'Record a notarization', icon: PenTool, action: 'journal-modal', color: 'bg-green-600' },
    { title: 'Track Mileage', description: 'Log business travel', icon: Car, action: 'mileage', color: 'bg-purple-600' },
    { title: 'View Reports', description: 'Check your analytics', icon: BarChart3, action: 'reports', color: 'bg-orange-600' }
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'receipt-modal':
        setShowReceiptModal(true);
        break;
      case 'journal-modal':
        setShowJournalModal(true);
        break;
      default:
        onNavigate(action);
    }
  };

  const categories = [
    'Office Supplies',
    'Fuel',
    'Meals & Entertainment',
    'Travel',
    'Equipment',
    'Software',
    'Marketing',
    'Professional Services',
    'Insurance',
    'Other'
  ];

  const addReceipt = (receiptData: any) => {
    // In a real app, this would save to your state management or API
    console.log('Receipt added:', receiptData);
    setShowReceiptModal(false);
    // You could show a success message here
  };

  const addJournalEntry = (entryData: any) => {
    // In a real app, this would save to your state management or API
    console.log('Journal entry added:', entryData);
    setShowJournalModal(false);
    // You could show a success message here
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your notary business today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${stat.color} font-medium`}>{stat.change}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`${action.color} p-2 rounded-lg`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <activity.icon className={`h-5 w-5 ${activity.color} mt-0.5`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* This Week Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Appointments</span>
                  <span className="font-semibold text-gray-900">5 completed</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="font-semibold text-green-600">$750</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Miles Driven</span>
                  <span className="font-semibold text-purple-600">67.3 mi</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Expenses</span>
                  <span className="font-semibold text-orange-600">$125</span>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                    <p className="text-xs text-gray-500">Tomorrow at 2:30 PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Michael Brown</p>
                    <p className="text-xs text-gray-500">Friday at 10:00 AM</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All Appointments
              </button>
            </div>

            {/* Tips & Resources */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips & Resources</h3>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-1">Tax Tip</p>
                  <p className="text-xs text-gray-600">Don't forget to track your home office expenses for additional deductions.</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-1">Best Practice</p>
                  <p className="text-xs text-gray-600">Always verify client identity with two forms of ID for important documents.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Modal */}
        {showReceiptModal && (
          <ReceiptModal
            onSave={addReceipt}
            onCancel={() => setShowReceiptModal(false)}
            title="Add New Receipt"
            categories={categories}
          />
        )}

        {/* Journal Entry Modal */}
        {showJournalModal && (
          <JournalEntryModal
            onSave={addJournalEntry}
            onCancel={() => setShowJournalModal(false)}
            title="Add Journal Entry"
          />
        )}
      </div>
    </div>
  );
}