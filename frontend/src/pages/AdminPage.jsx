import { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('parking');
  const [parkingLots, setParkingLots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [issues, setIssues] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingParking, setEditingParking] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    totalSlots: '',
    pricePerHour: ''
  });

  useEffect(() => {
    fetchParkingLots();
    fetchBookings();
    fetchIssues();
  }, []);

  const fetchParkingLots = async () => {
    try {
      const response = await api.get('/parking');
      setParkingLots(response.data);
    } catch (error) {
      setError('Failed to fetch parking lots');
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await api.get('/issues');
      setIssues(response.data);
    } catch (error) {
      console.error('Failed to fetch issues', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddParking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/parking', formData);
      setSuccess('Parking lot added successfully');
      setFormData({ name: '', address: '', totalSlots: '', pricePerHour: '' });
      setShowAddForm(false);
      fetchParkingLots();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add parking lot');
    }
  };

  const handleEditParking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.put(`/parking/${editingParking._id}`, formData);
      setSuccess('Parking lot updated successfully');
      setEditingParking(null);
      setFormData({ name: '', address: '', totalSlots: '', pricePerHour: '' });
      fetchParkingLots();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update parking lot');
    }
  };

  const handleDeleteParking = async (id) => {
    if (window.confirm('Are you sure you want to delete this parking lot?')) {
      try {
        await api.delete(`/parking/${id}`);
        setSuccess('Parking lot deleted successfully');
        fetchParkingLots();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete parking lot');
      }
    }
  };

  const startEdit = (parking) => {
    setEditingParking(parking);
    setFormData({
      name: parking.name,
      address: parking.address,
      totalSlots: parking.totalSlots,
      pricePerHour: parking.pricePerHour
    });
  };

  const handleResolveIssue = async (issueId) => {
    const resolution = prompt('Enter resolution:');
    if (resolution) {
      try {
        await api.put(`/issues/${issueId}/resolve`, { resolution });
        setSuccess('Issue resolved successfully');
        fetchIssues();
      } catch (error) {
        setError('Failed to resolve issue');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('parking')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'parking'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Parking Lots
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bookings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Bookings
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'issues'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Issues
          </button>
        </nav>
      </div>

      {/* Parking Lots Tab */}
      {activeTab === 'parking' && (
        <div>
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold transition duration-200"
            >
              {showAddForm ? 'Cancel' : 'Add New Parking Lot'}
            </button>
          </div>

          {/* Add/Edit Form */}
          {(showAddForm || editingParking) && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {editingParking ? 'Edit Parking Lot' : 'Add New Parking Lot'}
              </h2>
              <form onSubmit={editingParking ? handleEditParking : handleAddParking} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parking Lot Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Slots
                    </label>
                    <input
                      type="number"
                      name="totalSlots"
                      value={formData.totalSlots}
                      onChange={handleInputChange}
                      required
                      disabled={!!editingParking}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Hour (₹)
                    </label>
                    <input
                      type="number"
                      name="pricePerHour"
                      value={formData.pricePerHour}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition duration-200"
                  >
                    {editingParking ? 'Update' : 'Add'} Parking Lot
                  </button>
                  {editingParking && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingParking(null);
                        setFormData({ name: '', address: '', totalSlots: '', pricePerHour: '' });
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md font-medium transition duration-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Parking Lots List */}
          <div className="grid grid-cols-1 gap-4">
            {parkingLots.map((parking) => (
              <div key={parking._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">{parking.name}</h3>
                    <p className="text-gray-600 mt-1">{parking.address}</p>
                    <div className="mt-3 flex items-center space-x-4 text-sm">
                      <span className="text-gray-700">
                        <span className="font-semibold">Available:</span> {parking.availableSlots}/{parking.totalSlots}
                      </span>
                      <span className="text-blue-600 font-semibold">₹{parking.pricePerHour}/hr</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(parking)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteParking(parking._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">All Bookings</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parking Lot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.user?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.parkingLot?.name || 'Deleted Parking Lot'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.slotNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.duration}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{booking.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'active' ? 'bg-green-100 text-green-800' :
                        booking.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issues Tab */}
      {activeTab === 'issues' && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Issues</h2>
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{issue.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {issue.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{issue.description}</p>
                <p className="text-sm text-gray-500">Reported by: {issue.user.name}</p>
                {issue.status === 'pending' && (
                  <button
                    onClick={() => handleResolveIssue(issue._id)}
                    className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                  >
                    Resolve Issue
                  </button>
                )}
                {issue.resolution && (
                  <div className="mt-3 p-3 bg-green-50 rounded">
                    <p className="text-sm font-medium text-green-800">Resolution:</p>
                    <p className="text-sm text-green-700">{issue.resolution}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default AdminPage;
