import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Plus,
  Settings,
  Link,
  Calendar,
  MapPin,
  User,
  FileText,
  DollarSign,
  Filter,
  Search,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  fetchImportedOrders, 
  fetchIntegrations, 
  addImportedOrder, 
  updateOrderStatus, 
  toggleIntegration 
} from '../../store/slices/importOrdersSlice';

export default function ImportOrders() {
  const dispatch = useAppDispatch();
  const { orders, integrations, isLoading } = useAppSelector((state) => state.importOrders);
  const { user } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<'orders' | 'integrations'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showAddOrder, setShowAddOrder] = useState(false);

  // Load data on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchImportedOrders({ userId: user.id }));
      dispatch(fetchIntegrations({ userId: user.id }));
    }
  }, [dispatch, user?.id]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.signerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalFees: orders.reduce((sum, order) => sum + order.fee, 0),
    connectedIntegrations: integrations.filter(i => i.isConnected).length
  };

  const handleStatusUpdate = async (orderId: string, status: any) => {
    await dispatch(updateOrderStatus({ orderId, status }));
  };

  const handleToggleIntegration = async (integrationId: string, isConnected: boolean) => {
    await dispatch(toggleIntegration({ integrationId, isConnected }));
  };

  const handleAddOrder = async (orderData: any) => {
    if (!user?.id) return;

    const newOrderData = {
      userId: user.id,
      orderNumber: orderData.orderNumber || `ORD-${Date.now()}`,
      signerName: orderData.signerName || '',
      signerPhone: orderData.signerPhone || '',
      signerEmail: orderData.signerEmail || '',
      appointmentDate: orderData.appointmentDate || new Date().toISOString().split('T')[0],
      appointmentTime: orderData.appointmentTime || '10:00',
      address: orderData.address || '',
      city: orderData.city || '',
      state: orderData.state || '',
      zipCode: orderData.zipCode || '',
      documentType: orderData.documentType || '',
      fee: orderData.fee || 0,
      mileage: orderData.mileage || 0,
      status: orderData.status || 'pending',
      source: orderData.source || 'Manual',
      importedAt: new Date().toISOString(),
      notes: orderData.notes || '',
      specialInstructions: orderData.specialInstructions || ''
    };

    const result = await dispatch(addImportedOrder({ order: newOrderData }));
    
    if (addImportedOrder.fulfilled.match(result)) {
      setShowAddOrder(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIntegrationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Import Orders</h1>
          <p className="text-gray-600">Manage imported orders from signing platforms and integrations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
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
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Fees</p>
                <p className="text-2xl font-bold text-purple-600">${stats.totalFees.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.connectedIntegrations}</p>
              </div>
              <Link className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
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
                Platform Integrations
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                {/* Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
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
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowAddOrder(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Order
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync All
                    </button>
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {order.source}
                            </span>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              <span>{order.signerName}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{order.appointmentDate} at {order.appointmentTime}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{order.city}, {order.state}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-600">Document: {order.documentType}</span>
                            <span className="text-green-600 font-medium">Fee: ${order.fee.toFixed(2)}</span>
                            {order.mileage > 0 && (
                              <span className="text-purple-600">Mileage: {order.mileage} mi</span>
                            )}
                          </div>
                          
                          {order.specialInstructions && (
                            <p className="text-sm text-gray-500 mt-2 italic">{order.specialInstructions}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{integration.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntegrationStatusColor(integration.status)}`}>
                            {integration.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleIntegration(integration.id, !integration.isConnected)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              integration.isConnected
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {integration.isConnected ? 'Disconnect' : 'Connect'}
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
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
                        <div className="text-xs text-gray-500 border-t pt-3">
                          <p>Last sync: {integration.lastSync}</p>
                          <p>Orders imported: {integration.ordersImported}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Order Modal */}
        {showAddOrder && (
          <AddOrderModal
            onSave={handleAddOrder}
            onCancel={() => setShowAddOrder(false)}
          />
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  );
}

// Add Order Modal Component
interface AddOrderModalProps {
  onSave: (order: any) => void;
  onCancel: () => void;
}

function AddOrderModal({ onSave, onCancel }: AddOrderModalProps) {
  const [formData, setFormData] = useState({
    orderNumber: `ORD-${Date.now()}`,
    signerName: '',
    signerPhone: '',
    signerEmail: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    documentType: '',
    fee: 0,
    mileage: 0,
    source: 'Manual',
    notes: '',
    specialInstructions: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Order</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
              <input
                type="text"
                value={formData.orderNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, orderNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Signer Name</label>
              <input
                type="text"
                value={formData.signerName}
                onChange={(e) => setFormData(prev => ({ ...prev, signerName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.signerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, signerPhone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.signerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, signerEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Time</label>
              <input
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <input
                type="text"
                value={formData.documentType}
                onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee</label>
              <input
                type="number"
                step="0.01"
                value={formData.fee}
                onChange={(e) => setFormData(prev => ({ ...prev, fee: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
              <input
                type="number"
                step="0.1"
                value={formData.mileage}
                onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
            <textarea
              value={formData.specialInstructions}
              onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Any special instructions for this appointment..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Add Order
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

// Order Details Modal Component
interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
}

function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Order Number</label>
              <p className="text-gray-900">{order.orderNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Signer Name</label>
              <p className="text-gray-900">{order.signerName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Document Type</label>
              <p className="text-gray-900">{order.documentType}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Appointment Date & Time</label>
              <p className="text-gray-900">{order.appointmentDate} at {order.appointmentTime}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fee</label>
              <p className="text-gray-900">${order.fee.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <p className="text-gray-900">{order.address}, {order.city}, {order.state} {order.zipCode}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="text-gray-900">{order.signerPhone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{order.signerEmail}</p>
            </div>
          </div>

          {order.specialInstructions && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Special Instructions</label>
              <p className="text-gray-900">{order.specialInstructions}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Source</label>
              <p className="text-gray-900">{order.source}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Imported At</label>
              <p className="text-gray-900">{new Date(order.importedAt).toLocaleString()}</p>
            </div>
          </div>
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

function getStatusColor(status: string) {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function X({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}