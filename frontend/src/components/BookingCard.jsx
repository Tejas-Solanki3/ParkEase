const BookingCard = ({ booking, onExtend, onCancel }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'extended':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {booking.parkingLot?.name || 'Parking Lot (Deleted)'}
          </h3>
          <p className="text-sm text-gray-600">
            {booking.parkingLot?.address || 'Address not available'}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
          {booking.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Slot Number</p>
          <p className="text-sm font-medium text-gray-800">{booking.slotNumber}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Vehicle Number</p>
          <p className="text-sm font-medium text-gray-800">{booking.vehicleNumber || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Duration</p>
          <p className="text-sm font-medium text-gray-800">{booking.duration} hours</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Amount</p>
          <p className="text-sm font-bold text-blue-600">₹{booking.totalAmount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Start Time</p>
          <p className="text-sm font-medium text-gray-800">{formatDate(booking.startTime)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">End Time</p>
          <p className="text-sm font-medium text-gray-800">{formatDate(booking.endTime)}</p>
        </div>
      </div>

      <div className="flex justify-end items-center pt-4 border-t border-gray-200">
        {booking.status === 'active' || booking.status === 'extended' ? (
          <div className="space-x-2">
            <button
              onClick={() => onExtend(booking)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
            >
              Extend
            </button>
            <button
              onClick={() => onCancel(booking)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
            >
              Cancel
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BookingCard;
