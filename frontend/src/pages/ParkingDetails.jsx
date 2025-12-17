import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ParkingDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [parking, setParking] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [duration, setDuration] = useState(1);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [submittingIssue, setSubmittingIssue] = useState(false);

  useEffect(() => {
    fetchParkingDetails();
  }, [id]);

  const fetchParkingDetails = async () => {
    try {
      const response = await api.get(`/parking/${id}`);
      setParking(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch parking details');
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      setError('Please select a parking slot');
      return;
    }

    if (!vehicleNumber || vehicleNumber.trim().length === 0) {
      setError('Please enter your vehicle number');
      return;
    }

    // Basic vehicle number validation (adjust pattern based on your country)
    const vehiclePattern = /^[A-Z0-9\s-]+$/i;
    if (!vehiclePattern.test(vehicleNumber)) {
      setError('Please enter a valid vehicle number');
      return;
    }

    // Open payment modal
    setError('');
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    setError('');

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create booking
      const bookingResponse = await api.post('/bookings', {
        parkingLotId: parking._id,
        slotNumber: selectedSlot,
        duration: parseInt(duration),
        vehicleNumber: vehicleNumber.trim().toUpperCase()
      });

      // Process payment
      await api.post('/payments', {
        bookingId: bookingResponse.data._id,
        amount: bookingResponse.data.totalAmount,
        method: paymentMethod
      });

      setPaymentSuccess(true);
      setSuccess('Payment successful! Booking confirmed.');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/bookings');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
      setProcessingPayment(false);
    }
  };

  const calculateTotal = () => {
    return parking ? parking.pricePerHour * duration : 0;
  };

  const handleReportIssue = async () => {
    if (!issueTitle.trim() || !issueDescription.trim()) {
      setError('Please provide both title and description for the issue');
      return;
    }

    setSubmittingIssue(true);
    setError('');

    try {
      await api.post('/issues', {
        parkingLot: parking._id,
        title: issueTitle.trim(),
        description: issueDescription.trim()
      });

      setSuccess('Issue reported successfully! Our team will look into it.');
      setShowIssueModal(false);
      setIssueTitle('');
      setIssueDescription('');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to report issue. Please try again.');
    } finally {
      setSubmittingIssue(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!parking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Parking lot not found</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-4 text-blue-600 hover:text-blue-700 flex items-center font-medium"
      >
        <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{parking.name}</h1>
          <p className="text-gray-600 mt-2">{parking.address}</p>
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-2xl font-bold text-blue-600">₹{parking.pricePerHour}/hour</span>
            <span className="text-gray-600">
              {parking.availableSlots} of {parking.totalSlots} slots available
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Slot Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Slot</h2>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {parking.slots.map((slot) => (
              <button
                key={slot._id}
                onClick={() => slot.status === 'available' && setSelectedSlot(slot.slotNumber)}
                disabled={slot.status === 'booked'}
                className={`p-4 rounded-lg font-medium transition duration-200 ${
                  slot.status === 'available'
                    ? selectedSlot === slot.slotNumber
                      ? 'bg-blue-600 text-white'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {slot.slotNumber}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
              <span className="text-gray-600">Selected</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
              <span className="text-gray-600">Booked</span>
            </div>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Duration</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDuration(Math.max(1, duration - 1))}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-10 h-10 rounded-full font-semibold"
            >
              -
            </button>
            <span className="text-2xl font-bold text-gray-800 w-20 text-center">
              {duration} {duration === 1 ? 'hour' : 'hours'}
            </span>
            <button
              onClick={() => setDuration(duration + 1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-10 h-10 rounded-full font-semibold"
            >
              +
            </button>
          </div>
        </div>

        {/* Vehicle Number Input */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Vehicle Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Number *
            </label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder="e.g., ABC-1234 or MH-01-AB-1234"
              className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-lg uppercase"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter your vehicle registration number for parking record
            </p>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Selected Slot:</span>
              <span className="font-semibold text-gray-800">{selectedSlot || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle Number:</span>
              <span className="font-semibold text-gray-800">{vehicleNumber || 'Not entered'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-semibold text-gray-800">{duration} {duration === 1 ? 'hour' : 'hours'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price per hour:</span>
              <span className="font-semibold text-gray-800">₹{parking.pricePerHour}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-800">Total Amount:</span>
                <span className="font-bold text-blue-600">₹{calculateTotal()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={handleBooking}
          disabled={!selectedSlot || !vehicleNumber || booking}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed mb-3"
        >
          {booking ? 'Processing...' : 'Proceed to Payment'}
        </button>

        {/* Report Issue Button */}
        <button
          onClick={() => setShowIssueModal(true)}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition duration-200 flex items-center justify-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Report Issue
        </button>
      </div>

      {/* Report Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowIssueModal(false);
                setIssueTitle('');
                setIssueDescription('');
                setError('');
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              disabled={submittingIssue}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Issue</h2>
            <p className="text-gray-600 mb-6 text-sm">Help us improve by reporting any problems with this parking lot</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="e.g., Slot not available, Wrong pricing"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={submittingIssue}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Please describe the issue in detail..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                disabled={submittingIssue}
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleReportIssue}
              disabled={submittingIssue || !issueTitle.trim() || !issueDescription.trim()}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submittingIssue ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Issue'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 relative">
            {!paymentSuccess ? (
              <>
                {/* Close button */}
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  disabled={processingPayment}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Payment</h2>

                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parking Lot:</span>
                      <span className="font-medium text-gray-800">{parking.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Slot:</span>
                      <span className="font-medium text-gray-800">{selectedSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-medium text-gray-800">{vehicleNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium text-gray-800">{duration} {duration === 1 ? 'hour' : 'hours'}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between text-lg">
                        <span className="font-bold text-gray-800">Total Amount:</span>
                        <span className="font-bold text-blue-600">₹{calculateTotal()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Payment Method
                  </label>
                  <div className="space-y-3">
                    {/* UPI */}
                    <div
                      onClick={() => !processingPayment && setPaymentMethod('upi')}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        paymentMethod === 'upi'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${processingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full mr-3">
                        <span className="text-2xl">📱</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">UPI</p>
                        <p className="text-xs text-gray-500">GPay, PhonePe, Paytm</p>
                      </div>
                      {paymentMethod === 'upi' && (
                        <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Card */}
                    <div
                      onClick={() => !processingPayment && setPaymentMethod('card')}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        paymentMethod === 'card'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${processingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full mr-3">
                        <span className="text-2xl">💳</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Debit/Credit Card</p>
                        <p className="text-xs text-gray-500">Visa, Mastercard, RuPay</p>
                      </div>
                      {paymentMethod === 'card' && (
                        <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Cash */}
                    <div
                      onClick={() => !processingPayment && setPaymentMethod('cash')}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        paymentMethod === 'cash'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${processingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full mr-3">
                        <span className="text-2xl">💵</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Cash</p>
                        <p className="text-xs text-gray-500">Pay at parking</p>
                      </div>
                      {paymentMethod === 'cash' && (
                        <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    {error}
                  </div>
                )}

                {/* Pay Now Button */}
                <button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {processingPayment ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      Pay ₹{calculateTotal()} Now
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center py-8">
                  {/* Success Animation */}
                  <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
                    <svg className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                  <p className="text-gray-600 mb-6">Your parking slot has been booked successfully</p>
                  
                  {/* Booking Details */}
                  <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm text-gray-600 mb-2">Booking Confirmed</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Slot:</span>
                        <span className="font-semibold text-gray-800">{selectedSlot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle:</span>
                        <span className="font-semibold text-gray-800">{vehicleNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-semibold text-green-600">₹{calculateTotal()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Redirecting to your bookings...
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ParkingDetails;
