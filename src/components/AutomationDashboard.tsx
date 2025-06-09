import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  Users, 
  TrendingUp,
  Calendar,
  Send,
  CheckCircle,
  AlertCircle,
  Link,
  Settings,
  Zap,
  Globe,
  Shield,
  Smartphone
} from 'lucide-react';

interface Reminder {
  id: string;
  title: string;
  description: string;
  triggerType: 'time_before' | 'time_after' | 'specific_date';
  triggerValue: string;
  isActive: boolean;
  lastTriggered?: string;
  timesTriggered: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'appointment' | 'follow_up' | 'marketing' | 'reminder';
  timesUsed: number;
  timesSent: number;
}

interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  category: 'confirmation' | 'reminder' | 'update' | 'marketing';
  timesSent: number;
}

interface PlatformIntegration {
  id: string;
  name: string;
  description: string;
  category: 'signing' | 'calendar' | 'payment' | 'crm' | 'storage';
  isConnected: boolean;
  lastSync?: string;
  syncCount: number;
  features: string[];
  logo: React.ComponentType<any>;
  status: 'active' | 'error' | 'pending';
}

export default function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState<'reminders' | 'emails' | 'sms' | 'integrations'>('reminders');
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showAddEmail, setShowAddEmail] = useState(false);
  const [showAddSMS, setShowAddSMS] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [editingEmail, setEditingEmail] = useState<EmailTemplate | null>(null);
  const [editingSMS, setEditingSMS] = useState<SMSTemplate | null>(null);

  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Appointment Confirmation',
      description: 'Send confirmation 24 hours before appointment',
      triggerType: 'time_before',
      triggerValue: '24 hours',
      isActive: true,
      lastTriggered: '2025-01-14',
      timesTriggered: 45
    },
    {
      id: '2',
      title: 'Follow-up Reminder',
      description: 'Send follow-up 3 days after appointment',
      triggerType: 'time_after',
      triggerValue: '3 days',
      isActive: true,
      lastTriggered: '2025-01-13',
      timesTriggered: 32
    }
  ]);

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Appointment Confirmation',
      subject: 'Appointment Confirmation - {{date}} at {{time}}',
      content: 'Dear {{client_name}},\n\nThis confirms your notary appointment on {{date}} at {{time}}.\n\nLocation: {{location}}\nEstimated cost: {{total_amount}}\n\nPlease bring valid ID.\n\nBest regards,\n{{notary_name}}',
      category: 'appointment',
      timesUsed: 156,
      timesSent: 156
    },
    {
      id: '2',
      name: 'Thank You Follow-up',
      subject: 'Thank you for choosing our notary services',
      content: 'Dear {{client_name}},\n\nThank you for using our notary services. We hope everything went smoothly.\n\nIf you need any additional services, please don\'t hesitate to contact us.\n\nBest regards,\n{{notary_name}}',
      category: 'follow_up',
      timesUsed: 89,
      timesSent: 89
    }
  ]);

  const [smsTemplates, setSmsTemplates] = useState<SMSTemplate[]>([
    {
      id: '1',
      name: 'Appointment Reminder',
      content: 'Hi {{client_name}}, reminder: notary appointment tomorrow at {{time}}. Please bring valid ID. Reply STOP to opt out.',
      category: 'reminder',
      timesSent: 234
    },
    {
      id: '2',
      name: 'On My Way',
      content: 'Hi {{client_name}}, I\'m on my way to our appointment. ETA: {{eta}} minutes. See you soon!',
      category: 'update',
      timesSent: 67
    }
  ]);

  const [platformIntegrations, setPlatformIntegrations] = useState<PlatformIntegration[]>([
    {
      id: '1',
      name: 'DocuSign',
      description: 'Digital signature and document management platform',
      category: 'signing',
      isConnected: true,
      lastSync: '2025-01-15 10:30 AM',
      syncCount: 234,
      features: ['Document signing', 'Template management', 'Status tracking', 'Audit trails'],
      logo: Globe,
      status: 'active'
    },
    {
      id: '2',
      name: 'NotaryCam',
      description: 'Remote online notarization platform',
      category: 'signing',
      isConnected: true,
      lastSync: '2025-01-15 09:15 AM',
      syncCount: 89,
      features: ['RON sessions', 'Identity verification', 'Recording storage', 'Compliance tools'],
      logo: Shield,
      status: 'active'
    },
    {
      id: '3',
      name: 'Snapdocs',
      description: 'Digital mortgage closing platform',
      category: 'signing',
      isConnected: false,
      syncCount: 0,
      features: ['Loan document management', 'Signing coordination', 'Real-time updates', 'Mobile app'],
      logo: Smartphone,
      status: 'pending'
    },
    {
      id: '4',
      name: 'Google Calendar',
      description: 'Calendar and scheduling integration',
      category: 'calendar',
      isConnected: true,
      lastSync: '2025-01-15 11:45 AM',
      syncCount: 567,
      features: ['Two-way sync', 'Appointment blocking', 'Reminder notifications', 'Availability sharing'],
      logo: Calendar,
      status: 'active'
    },
    {
      id: '5',
      name: 'Stripe',
      description: 'Payment processing and invoicing',
      category: 'payment',
      isConnected: true,
      lastSync: '2025-01-15 08:20 AM',
      syncCount: 123,
      features: ['Online payments', 'Recurring billing', 'Invoice generation', 'Payment tracking'],
      logo: Zap,
      status: 'active'
    },
    {
      id: '6',
      name: 'Notarize',
      description: 'Online notarization platform',
      category: 'signing',
      isConnected: false,
      syncCount: 0,
      features: ['Remote notarization', 'Identity verification', 'Document storage', 'API integration'],
      logo: Link,
      status: 'pending'
    },
    {
      id: '7',
      name: 'QuickBooks',
      description: 'Accounting and bookkeeping software',
      category: 'crm',
      isConnected: true,
      lastSync: '2025-01-14 06:30 PM',
      syncCount: 445,
      features: ['Expense tracking', 'Invoice sync', 'Tax reporting', 'Financial analytics'],
      logo: TrendingUp,
      status: 'error'
    },
    {
      id: '8',
      name: 'Dropbox',
      description: 'Cloud storage and file sharing',
      category: 'storage',
      isConnected: true,
      lastSync: '2025-01-15 12:00 PM',
      syncCount: 1234,
      features: ['Document backup', 'File sharing', 'Version control', 'Mobile access'],
      logo: Globe,
      status: 'active'
    }
  ]);

  // Calculate stats
  const stats = {
    totalReminders: reminders.length,
    activeReminders: reminders.filter(r => r.isActive).length,
    totalEmailsSent: emailTemplates.reduce((sum, template) => sum + (template.timesSent || 0), 0),
    totalSMSSent: smsTemplates.reduce((sum, template) => sum + (template.timesSent || 0), 0),
    totalTriggered: reminders.reduce((sum, reminder) => sum + (reminder.timesTriggered || 0), 0),
    connectedIntegrations: platformIntegrations.filter(p => p.isConnected).length,
    totalIntegrations: platformIntegrations.length
  };

  const addReminder = (reminderData: Partial<Reminder>) => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: reminderData.title || '',
      description: reminderData.description || '',
      triggerType: reminderData.triggerType || 'time_before',
      triggerValue: reminderData.triggerValue || '',
      isActive: true,
      timesTriggered: 0
    };
    setReminders(prev => [newReminder, ...prev]);
    setShowAddReminder(false);
  };

  const updateReminder = (updatedReminder: Reminder) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === updatedReminder.id ? updatedReminder : reminder
    ));
    setEditingReminder(null);
  };

  const deleteReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
  };

  const toggleReminderStatus = (reminderId: string) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === reminderId ? { ...reminder, isActive: !reminder.isActive } : reminder
    ));
  };

  const toggleIntegration = (integrationId: string) => {
    setPlatformIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            isConnected: !integration.isConnected,
            status: !integration.isConnected ? 'active' : 'pending',
            lastSync: !integration.isConnected ? new Date().toLocaleString() : undefined
          } 
        : integration
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'signing': return 'bg-blue-100 text-blue-800';
      case 'calendar': return 'bg-purple-100 text-purple-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'crm': return 'bg-orange-100 text-orange-800';
      case 'storage': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Automation Dashboard</h1>
          <p className="text-gray-600">Manage your automated workflows and platform integrations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Reminders</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeReminders}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Emails Sent</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalEmailsSent}</p>
              </div>
              <Mail className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SMS Sent</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalSMSSent}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Times Triggered</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalTriggered}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected Apps</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.connectedIntegrations}</p>
              </div>
              <Link className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reminders</p>
                <p className="text-2xl font-bold text-gray-600">{stats.totalReminders}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('reminders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reminders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Bell className="h-4 w-4 inline mr-2" />
                Automatic Reminders
              </button>
              <button
                onClick={() => setActiveTab('emails')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'emails'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Mail className="h-4 w-4 inline mr-2" />
                Email Templates
              </button>
              <button
                onClick={() => setActiveTab('sms')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sms'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="h-4 w-4 inline mr-2" />
                SMS Templates
              </button>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'integrations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Link className="h-4 w-4 inline mr-2" />
                Platform Integrations
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Reminders Tab */}
            {activeTab === 'reminders' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Automatic Reminders</h2>
                  <button
                    onClick={() => setShowAddReminder(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Reminder
                  </button>
                </div>

                <div className="space-y-4">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reminder.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {reminder.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{reminder.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Trigger: {reminder.triggerValue} {reminder.triggerType.replace('_', ' ')}</span>
                            <span>Triggered: {reminder.timesTriggered} times</span>
                            {reminder.lastTriggered && (
                              <span>Last: {reminder.lastTriggered}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleReminderStatus(reminder.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              reminder.isActive
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {reminder.isActive ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => setEditingReminder(reminder)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteReminder(reminder.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email Templates Tab */}
            {activeTab === 'emails' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
                  <button
                    onClick={() => setShowAddEmail(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Template
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {emailTemplates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingEmail(template)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Subject: {template.subject}</p>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-3">{template.content}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {template.category}
                        </span>
                        <span className="text-gray-500">Used {template.timesUsed} times</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SMS Templates Tab */}
            {activeTab === 'sms' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">SMS Templates</h2>
                  <button
                    onClick={() => setShowAddSMS(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Template
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {smsTemplates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingSMS(template)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{template.content}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          {template.category}
                        </span>
                        <span className="text-gray-500">Sent {template.timesSent} times</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Integrations Tab */}
            {activeTab === 'integrations' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Platform Integrations</h2>
                  <div className="text-sm text-gray-600">
                    {stats.connectedIntegrations} of {stats.totalIntegrations} platforms connected
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">All Platforms</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200">Signing Platforms</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200">Calendar</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200">Payments</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200">CRM</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200">Storage</span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {platformIntegrations.map((integration) => (
                    <div key={integration.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <integration.logo className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(integration.category)}`}>
                              {integration.category}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                          {integration.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{integration.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-medium text-gray-900">Features:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {integration.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                          {integration.features.length > 3 && (
                            <li className="text-gray-400">+{integration.features.length - 3} more features</li>
                          )}
                        </ul>
                      </div>
                      
                      {integration.isConnected && integration.lastSync && (
                        <div className="text-xs text-gray-500 mb-4">
                          <p>Last sync: {integration.lastSync}</p>
                          <p>Sync count: {integration.syncCount}</p>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleIntegration(integration.id)}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                            integration.isConnected
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {integration.isConnected ? 'Disconnect' : 'Connect'}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg transition-colors">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showAddReminder && (
          <ReminderModal
            onSave={addReminder}
            onCancel={() => setShowAddReminder(false)}
            title="Add New Reminder"
          />
        )}

        {editingReminder && (
          <ReminderModal
            reminder={editingReminder}
            onSave={updateReminder}
            onCancel={() => setEditingReminder(null)}
            title="Edit Reminder"
          />
        )}
      </div>
    </div>
  );
}

interface ReminderModalProps {
  reminder?: Reminder;
  onSave: (reminder: any) => void;
  onCancel: () => void;
  title: string;
}

function ReminderModal({ reminder, onSave, onCancel, title }: ReminderModalProps) {
  const [formData, setFormData] = useState({
    title: reminder?.title || '',
    description: reminder?.description || '',
    triggerType: reminder?.triggerType || 'time_before',
    triggerValue: reminder?.triggerValue || '',
    isActive: reminder?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reminder) {
      onSave({ ...reminder, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
            <select
              value={formData.triggerType}
              onChange={(e) => setFormData(prev => ({ ...prev, triggerType: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="time_before">Time Before</option>
              <option value="time_after">Time After</option>
              <option value="specific_date">Specific Date</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Value</label>
            <input
              type="text"
              value={formData.triggerValue}
              onChange={(e) => setFormData(prev => ({ ...prev, triggerValue: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 24 hours, 2 days, 2025-01-20"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Save Reminder
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}