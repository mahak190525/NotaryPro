import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Settings, 
  Plus,
  Link,
  FileText,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Building,
  Shield,
  Zap,
  Globe,
  Eye,
  Edit3,
  Trash2,
  Filter,
  Search,
  X
} from 'lucide-react';

interface ImportedOrder {
  id: string;
  orderNumber: string;
  signerName: string;
  signerPhone: string;
  signerEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  documentType: string;
  fee: number;
  mileage: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  source: string;
  importedAt: string;
  notes: string;
  specialInstructions: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'signing' | 'escrow' | 'title' | 'lender';
  isConnected: boolean;
  lastSync?: string;
  ordersImported: number;
  logo: React.ComponentType<any>;
  status: 'active' | 'error' | 'pending' | 'setup_required';
  features: string[];
  setupSteps: string[];
}

export default function ImportOrders() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'integrations' | 'settings'>('dashboard');
  const [showAddIntegration, setShowAddIntegration] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<ImportedOrder | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const [orders, setOrders] = useState<ImportedOrder[]>([
    {
      id: '1',
      orderNumber: 'SD-2025-001234',
      signerName: 'John Smith',
      signerPhone: '(555) 123-4567',
      signerEmail: 'john.smith@email.com',
      appointmentDate: '2025-01-20',
      appointmentTime: '10:00 AM',
      address: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      documentType: 'Loan Documents',
      fee: 150.00,
      mileage: 12.5,
      status: 'confirmed',
      source: 'SnapDocs',
      importedAt: '2025-01-15 09:30 AM',
      notes: 'First-time buyer, may need extra time',
      specialInstructions: 'Please bring extra pens and call 30 minutes before arrival'
    },
    {
      id: '2',
      orderNumber: 'SO-2025-005678',
      signerName: 'Sarah Johnson',
      signerPhone: '(555) 987-6543',
      signerEmail: 'sarah.j@email.com',
      appointmentDate: '2025-01-22',
      appointmentTime: '2:30 PM',
      address: '456 Oak Avenue',
      city: 'Beverly Hills',
      state: 'CA',
      zipCode: '90212',
      documentType: 'Refinance Documents',
      fee: 125.00,
      mileage: 8.3,
      status: 'pending',
      source: 'SigningOrder',
      importedAt: '2025-01-15 11:45 AM',
      notes: 'Experienced signer, quick appointment expected',
      specialInstructions: 'Parking available in driveway'
    },
    {
      id: '3',
      orderNumber: 'FNF-2025-009876',
      signerName: 'Michael Brown',
      signerPhone: '(555) 456-7890',
      signerEmail: 'mbrown@email.com',
      appointmentDate: '2025-01-18',
      appointmentTime: '4:00 PM',
      address: '789 Pine Road',
      city: 'Santa Monica',
      state: 'CA',
      zipCode: '90401',
      documentType: 'Purchase Documents',
      fee: 175.00,
      mileage: 15.2,
      status: 'completed',
      source: 'Fidelity National Title',
      importedAt: '2025-01-14 02:15 PM',
      notes: 'Completed successfully',
      specialInstructions: 'Use side entrance, ring doorbell twice'
    }
  ]);

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'SnapDocs',
      description: 'Leading digital mortgage closing platform',
      category: 'signing',
      isConnected: true,
      lastSync: '2025-01-15 12:00 PM',
      ordersImported: 234,
      logo: FileText,
      status: 'active',
      features: ['Real-time order sync', 'Document management', 'Status updates', 'Fee tracking'],
      setupSteps: ['Create SnapDocs account', 'Generate API key', 'Configure webhook URL', 'Test connection']
    },
    {
      id: '2',
      name: 'SigningOrder',
      description: 'Comprehensive notary order management system',
      category: 'signing',
      isConnected: true,
      lastSync: '2025-01-15 11:30 AM',
      ordersImported: 156,
      logo: Calendar,
      status: 'active',
      features: ['Order automation', 'Calendar integration', 'Payment processing', 'Client communication'],
      setupSteps: ['Register with SigningOrder', 'Verify notary credentials', 'Set up payment method', 'Configure preferences']
    },
    {
      id: '3',
      name: 'Fidelity National Title',
      description: 'Major title insurance and escrow services',
      category: 'title',
      isConnected: true,
      lastSync: '2025-01-15 10:45 AM',
      ordersImported: 89,
      logo: Building,
      status: 'active',
      features: ['Title order sync', 'Escrow coordination', 'Document tracking', 'Settlement services'],
      setupSteps: ['Contact FNF representative', 'Complete vendor application', 'Provide insurance certificates', 'Set up portal access']
    },
    {
      id: '4',
      name: 'First American Title',
      description: 'Leading title insurance and settlement services',
      category: 'title',
      isConnected: false,
      ordersImported: 0,
      logo: Shield,
      status: 'setup_required',
      features: ['Order management', 'Document delivery', 'Fee tracking', 'Quality assurance'],
      setupSteps: ['Submit vendor application', 'Complete background check', 'Provide E&O insurance', 'Complete training modules']
    },
    {
      id: '5',
      name: 'Chicago Title',
      description: 'Comprehensive title and escrow services',
      category: 'title',
      isConnected: false,
      ordersImported: 0,
      logo: Globe,
      status: 'pending',
      features: ['Real-time updates', 'Mobile access', 'Document management', 'Compliance tracking'],
      setupSteps: ['Create vendor profile', 'Submit credentials', 'Complete onboarding', 'Test integration']
    },
    {
      id: '6',
      name: 'Stewart Title',
      description: 'Full-service title insurance company',
      category: 'title',
      isConnected: false,
      ordersImported: 0,
      logo: Zap,
      status: 'setup_required',
      features: ['Order notifications', 'Document access', 'Fee management', 'Performance tracking'],
      setupSteps: ['Apply for vendor status', 'Background verification', 'Insurance validation', 'System training']
    },
    {
      id: '7',
      name: 'Old Republic Title',
      description: 'Trusted title insurance and closing services',
      category: 'title',
      isConnected: false,
      ordersImported: 0,
      logo: Building,
      status: 'setup_required',
      features: ['Automated workflows', 'Digital signatures', 'Compliance tools', 'Reporting dashboard'],
      setupSteps: ['Vendor registration', 'Credential verification', 'Technology setup', 'Go-live testing']
    },
    {
      id: '8',
      name: 'Quicken Loans',
      description: 'Major mortgage lender with digital platform',
      category: 'lender',
      isConnected: false,
      ordersImported: 0,
      logo: DollarSign,
      status: 'setup_required',
      features: ['Loan order sync', 'Borrower communication', 'Document tracking', 'Quality control'],
      setupSteps: ['Vendor application', 'Compliance review', 'Technology integration', 'Performance monitoring']
    }
  ]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.signerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSource = filterSource === 'all' || order.source === filterSource;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, order) => sum + order.fee, 0),
    connectedIntegrations: integrations.filter(i => i.isConnected).length,
    totalIntegrations: integrations.length
  };

  const handleImportOrders = async (integrationId: string) => {
    setIsImporting(true);
    
    // Simulate import process
    setTimeout(() => {
      const integration = integrations.find(i => i.id === integrationId);
      if (integration) {
        // Simulate new orders
        const newOrders: ImportedOrder[] = [
          {
            id: Date.now().toString(),
            orderNumber: `${integration.name.substring(0, 2).toUpperCase()}-2025-${Math.floor(Math.random() * 10000).toString().padStart(6, '0')}`,
            signerName: 'New Client',
            signerPhone: '(555) 000-0000',
            signerEmail: 'newclient@email.com',
            appointmentDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
            appointmentTime: '10:00 AM',
            address: '123 New Street',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            documentType: 'Loan Documents',
            fee: 150.00,
            mileage: 10.0,
            status: 'pending',
            source: integration.name,
            importedAt: new Date().toLocaleString(),
            notes: 'Newly imported order',
            specialInstructions: 'Standard appointment'
          }
        ];
        
        setOrders(prev => [...newOrders, ...prev]);
        setIntegrations(prev => prev.map(i => 
          i.id === integrationId 
            ? { ...i, lastSync: new Date().toLocaleString(), ordersImported: i.ordersImported + newOrders.length }
            : i
        ));
      }
      setIsImporting(false);
    }, 2000);
  };

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            isConnected: !integration.isConnected,
            status: !integration.isConnected ? 'active' : 'setup_required',
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
      case 'setup_required': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'signing': return 'bg-blue-100 text-blue-800';
      case 'escrow': return 'bg-purple-100 text-purple-800';
      case 'title': return 'bg-green-100 text-green-800';
      case 'lender': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Import Orders</h1>
          <p className="text-gray-600">Automatically sync orders from major signing platforms and title companies</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmedOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-purple-600">{stats.connectedIntegrations}</p>
              </div>
              <Link className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Zap className="h-4 w-4 inline mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Imported Orders
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
                Integrations
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                  <button
                    onClick={() => handleImportOrders('all')}
                    disabled={isImporting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                  >
                    {isImporting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {isImporting ? 'Importing...' : 'Import All Orders'}
                  </button>
                </div>

                {/* Connected Integrations Quick View */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {integrations.filter(i => i.isConnected).map((integration) => (
                    <div key={integration.id} className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-white p-2 rounded-lg">
                            <integration.logo className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                              {integration.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Orders Imported:</span>
                          <span className="font-medium">{integration.ordersImported}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Sync:</span>
                          <span className="font-medium">{integration.lastSync}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleImportOrders(integration.id)}
                        disabled={isImporting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isImporting ? 'animate-spin' : ''}`} />
                        Sync Now
                      </button>
                    </div>
                  ))}
                </div>

                {/* Recent Orders */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{order.signerName}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                              <span className="text-sm text-gray-500">{order.source}</span>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{order.appointmentDate} at {order.appointmentTime}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{order.city}, {order.state}</span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2" />
                                <span>${order.fee.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Imported Orders</h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                      value={filterSource}
                      onChange={(e) => setFilterSource(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Sources</option>
                      {integrations.filter(i => i.isConnected).map(integration => (
                        <option key={integration.id} value={integration.name}>{integration.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="font-semibold text-gray-900">{order.signerName}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{order.source}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">Order #{order.orderNumber}</p>
                          <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{order.appointmentDate} at {order.appointmentTime}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{order.address}, {order.city}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2" />
                              <span>${order.fee.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              <span>{order.signerPhone}</span>
                            </div>
                          </div>
                          {order.specialInstructions && (
                            <p className="text-sm text-blue-600 mt-2">
                              <strong>Instructions:</strong> {order.specialInstructions}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Edit Order"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Order"
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

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Available Integrations</h2>
                  <div className="text-sm text-gray-600">
                    {stats.connectedIntegrations} of {stats.totalIntegrations} platforms connected
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">All Platforms</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200">Signing Platforms</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200">Title Companies</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200">Escrow Services</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200">Lenders</span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {integrations.map((integration) => (
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
                          {integration.status.replace('_', ' ')}
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
                          <p>Orders imported: {integration.ordersImported}</p>
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
                        <button 
                          onClick={() => setSelectedIntegration(integration)}
                          className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Import Settings</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Automatic Import Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-900">Auto-import new orders</label>
                          <p className="text-sm text-gray-500">Automatically import orders as they become available</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-900">Email notifications</label>
                          <p className="text-sm text-gray-500">Get notified when new orders are imported</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-900">SMS notifications</label>
                          <p className="text-sm text-gray-500">Receive text alerts for urgent orders</p>
                        </div>
                        <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Sync Frequency</h3>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="realtime">Real-time (recommended)</option>
                      <option value="15min">Every 15 minutes</option>
                      <option value="30min">Every 30 minutes</option>
                      <option value="1hour">Every hour</option>
                      <option value="manual">Manual only</option>
                    </select>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Default Order Settings</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default status for new orders</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="pending">Pending</option>
                          <option value="confirmed">Auto-confirm</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum fee threshold</label>
                        <input 
                          type="number" 
                          placeholder="0.00" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}

        {/* Integration Setup Modal */}
        {selectedIntegration && (
          <IntegrationSetupModal
            integration={selectedIntegration}
            onClose={() => setSelectedIntegration(null)}
          />
        )}
      </div>
    </div>
  );
}

interface OrderDetailsModalProps {
  order: ImportedOrder;
  onClose: () => void;
}

function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Order Number</label>
              <p className="text-gray-900 font-mono">{order.orderNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Source</label>
              <p className="text-gray-900">{order.source}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Signer Name</label>
              <p className="text-gray-900">{order.signerName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.status}
              </span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="text-gray-900">{order.signerPhone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{order.signerEmail}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Appointment Date</label>
              <p className="text-gray-900">{order.appointmentDate}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Appointment Time</label>
              <p className="text-gray-900">{order.appointmentTime}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <p className="text-gray-900">{order.address}, {order.city}, {order.state} {order.zipCode}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Document Type</label>
              <p className="text-gray-900">{order.documentType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fee</label>
              <p className="text-gray-900 font-semibold">${order.fee.toFixed(2)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mileage</label>
              <p className="text-gray-900">{order.mileage} miles</p>
            </div>
          </div>
          
          {order.specialInstructions && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Special Instructions</label>
              <p className="text-gray-900">{order.specialInstructions}</p>
            </div>
          )}
          
          {order.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <p className="text-gray-900">{order.notes}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Imported At</label>
            <p className="text-gray-900">{order.importedAt}</p>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 flex space-x-3">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
            Confirm Order
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface IntegrationSetupModalProps {
  integration: Integration;
  onClose: () => void;
}

function IntegrationSetupModal({ integration, onClose }: IntegrationSetupModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">{integration.name} Setup</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <p className="text-gray-600">{integration.description}</p>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Setup Steps</h4>
            <div className="space-y-3">
              {integration.setupSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Features</h4>
            <div className="grid md:grid-cols-2 gap-2">
              {integration.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          {!integration.isConnected && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Ready to Connect?</h4>
              <p className="text-sm text-blue-700 mb-3">
                Complete the setup steps above, then click the button below to establish the connection.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Start Setup Process
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}