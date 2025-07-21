import React, { useState, useEffect } from 'react';
import { MapPin, Play, Square, Car, Calendar, DollarSign, Plus, Edit3, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMileageTrips, addMileageTrip, updateMileageTrip, deleteMileageTrip } from '../../store/slices/mileageSlice';

export default function MileageTracker() {
  const dispatch = useAppDispatch();
  const { trips, isLoading, totalMiles, businessMiles, totalDeduction } = useAppSelector((state) => state.mileage);
  const { user } = useAppSelector((state) => state.auth);

  const [isTracking, setIsTracking] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<any>({});
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'business' | 'personal'>('all');

  // Load mileage trips on component mount
  React.useEffect(() => {
    if (user?.id) {
      dispatch(fetchMileageTrips({ userId: user.id }));
    }
  }, [dispatch, user?.id]);

  const startTracking = () => {
    setIsTracking(true);
    setCurrentTrip({
      id: Date.now().toString(),
      startLocation: 'Current Location',
      date: new Date().toISOString().split('T')[0],
      category: 'business',
      rate: 0.70,
      isTracking: true
    });
  };

  const stopTracking = () => {
    if (currentTrip.id) {
      const newTrip = {
        ...currentTrip,
        endLocation: 'Current Location',
        distance: Math.random() * 20 + 5, // Simulated distance
        purpose: 'Business trip',
        amount: 0,
        isTracking: false
      };
      
      newTrip.amount = newTrip.distance * newTrip.rate;
      
      handleAddTrip(newTrip);
      setCurrentTrip({});
    }
    setIsTracking(false);
  };

  const handleAddTrip = async (tripData: any) => {
    if (!user?.id) return;

    const newTripData = {
      userId: user.id,
      startLocation: tripData.startLocation || '',
      endLocation: tripData.endLocation || '',
      distance: tripData.distance || 0,
      date: tripData.date || new Date().toISOString().split('T')[0],
      purpose: tripData.purpose || '',
      category: tripData.category || 'business',
      rate: 0.70,
      amount: (tripData.distance || 0) * 0.70
    };

    const result = await dispatch(addMileageTrip({ trip: newTripData }));
    
    if (addMileageTrip.fulfilled.match(result)) {
      setShowAddTrip(false);
    }
  };

  const handleUpdateTrip = async (updatedTrip: any) => {
    updatedTrip.amount = updatedTrip.distance * updatedTrip.rate;
    const result = await dispatch(updateMileageTrip({ trip: updatedTrip }));
    
    if (updateMileageTrip.fulfilled.match(result)) {
      setEditingTrip(null);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    await dispatch(deleteMileageTrip({ tripId }));
  };

  const addManualTrip = (tripData: any) => {
    handleAddTrip(tripData);
    setShowAddTrip(false);
  };

  const updateTrip = (updatedTrip: any) => {
    handleUpdateTrip(updatedTrip);
    setEditingTrip(null);
  };

  const deleteTrip = (tripId: string) => {
    handleDeleteTrip(tripId);
  };

  const filteredTrips = trips.filter(trip => 
    filter === 'all' || trip.category === filter
  );

  const filteredTotalMiles = filteredTrips.reduce((sum, trip) => sum + trip.distance, 0);
  const filteredTotalAmount = filteredTrips.reduce((sum, trip) => sum + trip.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mileage Tracker</h1>
          <p className="text-gray-600">Track your business miles and maximize tax deductions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Miles</p>
                <p className="text-2xl font-bold text-gray-900">{filteredTotalMiles.toFixed(1)}</p>
              </div>
              <Car className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Business Miles</p>
                <p className="text-2xl font-bold text-green-600">{businessMiles.toFixed(1)}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tax Deduction</p>
                <p className="text-2xl font-bold text-purple-600">${filteredTotalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Rate</p>
                <p className="text-2xl font-bold text-orange-600">$0.70</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tracking Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              {!isTracking ? (
                <button
                  onClick={startTracking}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Trip
                </button>
              ) : (
                <button
                  onClick={stopTracking}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors"
                >
                  <Square className="h-5 w-5 mr-2" />
                  Stop Trip
                </button>
              )}
              <button
                onClick={() => setShowAddTrip(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Manual Trip
              </button>
            </div>
            {isTracking && (
              <div className="flex items-center text-green-600">
                <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse mr-2"></div>
                <span className="font-medium">Tracking in progress...</span>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Trip History</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Trips
              </button>
              <button
                onClick={() => setFilter('business')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'business' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Business
              </button>
              <button
                onClick={() => setFilter('personal')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'personal' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Personal
              </button>
            </div>
          </div>
        </div>

        {/* Trip List */}
        <div className="space-y-4">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      trip.category === 'business' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {trip.category}
                    </span>
                    <span className="text-sm text-gray-500">{trip.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{trip.purpose}</h3>
                  <div className="text-sm text-gray-600">
                    <p>{trip.startLocation} → {trip.endLocation}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Distance</p>
                    <p className="font-semibold text-gray-900">{trip.distance.toFixed(1)} mi</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-semibold text-green-600">${trip.amount.toFixed(2)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingTrip(trip)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteTrip(trip.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Trip Modal */}
        {showAddTrip && (
          <TripModal
            onSave={addManualTrip}
            onCancel={() => setShowAddTrip(false)}
            title="Add Manual Trip"
          />
        )}

        {/* Edit Trip Modal */}
        {editingTrip && (
          <TripModal
            trip={editingTrip}
            onSave={updateTrip}
            onCancel={() => setEditingTrip(null)}
            title="Edit Trip"
          />
        )}
      </div>
    </div>
  );
}

interface TripModalProps {
  trip?: Trip;
  onSave: (trip: any) => void;
  onCancel: () => void;
  title: string;
}

function TripModal({ trip, onSave, onCancel, title }: TripModalProps) {
  const [formData, setFormData] = useState({
    startLocation: trip?.startLocation || '',
    endLocation: trip?.endLocation || '',
    distance: trip?.distance || 0,
    date: trip?.date || new Date().toISOString().split('T')[0],
    purpose: trip?.purpose || '',
    category: trip?.category || 'business'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trip) {
      onSave({ ...trip, ...formData });
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Location</label>
            <input
              type="text"
              value={formData.startLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, startLocation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Location</label>
            <input
              type="text"
              value={formData.endLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, endLocation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance (miles)</label>
            <input
              type="number"
              step="0.1"
              value={formData.distance}
              onChange={(e) => setFormData(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Client meeting, Document signing"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'business' | 'personal' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="business">Business</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Save Trip
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