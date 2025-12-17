const ParkingCard = ({ parking, onBook }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{parking.name}</h3>
          <p className="text-gray-600 text-sm mt-1">{parking.address}</p>
        </div>
        <div className="bg-blue-100 text-primary px-3 py-1 rounded-full text-sm font-semibold">
          ₹{parking.pricePerHour}/hr
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-gray-700">
            <span className="font-bold text-green-600">{parking.availableSlots}</span> / {parking.totalSlots} slots available
          </span>
        </div>
      </div>

      <button
        onClick={() => onBook(parking)}
        disabled={parking.availableSlots === 0}
        className={`w-full mt-4 py-2 px-4 rounded-md font-medium transition duration-200 ${
          parking.availableSlots > 0
            ? 'bg-primary hover:bg-blue-600 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {parking.availableSlots > 0 ? 'Book Now' : 'No Slots Available'}
      </button>
    </div>
  );
};

export default ParkingCard;
