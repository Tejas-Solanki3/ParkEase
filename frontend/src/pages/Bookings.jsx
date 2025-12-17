import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import BookingCard from '../components/BookingCard';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [extendingBooking, setExtendingBooking] = useState(null);
  const [additionalHours, setAdditionalHours] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get(`/bookings/user/${user._id}`);
      setBookings(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch bookings');
      setLoading(false);
    }
  };

  const handleExtend = (booking) => {
    setExtendingBooking(booking);
  };

  const confirmExtend = async () => {
    try {
      await api.put(`/bookings/${extendingBooking._id}/extend`, {
        additionalHours: parseInt(additionalHours)
      });
      setExtendingBooking(null);
      setAdditionalHours(1);
      fetchBookings();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to extend booking');
    }
  };

  const handleCancel = async (booking) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.put(`/bookings/${booking._id}/cancel`);
        fetchBookings();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
        <p className="text-gray-600 mt-2">View and manage your parking bookings</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
          <p className="mt-1 text-sm text-gray-500">Start by booking a parking slot from the dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onExtend={handleExtend}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      {/* Extend Booking Modal */}
      {extendingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Extend Booking</h2>
            <p className="text-gray-600 mb-4">
              Extend your booking for {extendingBooking.parkingLot.name}
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Hours
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setAdditionalHours(Math.max(1, additionalHours - 1))}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-10 h-10 rounded-full font-semibold"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-gray-800 w-16 text-center">
                  {additionalHours}
                </span>
                <button
                  onClick={() => setAdditionalHours(additionalHours + 1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-10 h-10 rounded-full font-semibold"
                >
                  +
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Additional cost: ₹{extendingBooking.parkingLot.pricePerHour * additionalHours}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setExtendingBooking(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-md font-medium transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmExtend}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Bookings;
