import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../utils/api';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for parking lots
const createParkingIcon = (availableSlots, totalSlots) => {
  let color = 'red'; // Default: Full
  const availabilityPercent = (availableSlots / totalSlots) * 100;
  
  if (availabilityPercent > 50) {
    color = 'green'; // More than 50% available
  } else if (availabilityPercent > 20) {
    color = 'orange'; // 20-50% available
  } else if (availabilityPercent > 0) {
    color = 'yellow'; // Less than 20% but still available
  }
  // else red (0% available - full)

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Component to handle map centering
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

const MapView = ({ height = '500px' }) => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchParkingLots();
    getUserLocation();
  }, []);

  const fetchParkingLots = async () => {
    try {
      const response = await api.get('/parking');
      setParkingLots(response.data);
    } catch (error) {
      console.error('Failed to fetch parking lots:', error);
    }
  };

  const getUserLocation = () => {
    // Get user's current location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLoading(false);
        },
        (err) => {
          console.error('Error getting location:', err);
          // Default location (San Francisco coordinates as fallback)
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
          setError('Location access denied. Showing default location.');
          setLoading(false);
        }
      );
    } else {
      setUserLocation({ lat: 37.7749, lng: -122.4194 });
      setError('Geolocation not supported. Showing default location.');
      setLoading(false);
    }
  };

  const handleBookNow = (parkingId) => {
    navigate(`/parking/${parkingId}`);
  };

  if (loading) {
    return (
      <div style={{ height }} className="bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div style={{ height }} className="bg-gray-100 rounded-2xl flex items-center justify-center">
        <p className="text-gray-600">Unable to load map</p>
      </div>
    );
  }

  // Custom icon for user location
  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ height }}>
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />

        {/* User Location Marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="text-center p-2">
              <strong className="text-blue-600 text-lg">You are here</strong>
              <p className="text-sm text-gray-600 mt-1">Your current location</p>
            </div>
          </Popup>
        </Marker>

        {/* Parking Location Markers */}
        {parkingLots.map((parking) => {
          // Generate random location near user for demo (in production, use actual lat/lng from database)
          const offsetLat = userLocation.lat + (Math.random() - 0.5) * 0.05;
          const offsetLng = userLocation.lng + (Math.random() - 0.5) * 0.05;
          
          const availabilityPercent = (parking.availableSlots / parking.totalSlots) * 100;
          let availabilityStatus = 'Full';
          let availabilityColor = 'text-red-600';
          
          if (availabilityPercent > 50) {
            availabilityStatus = 'High Availability';
            availabilityColor = 'text-green-600';
          } else if (availabilityPercent > 20) {
            availabilityStatus = 'Moderate Availability';
            availabilityColor = 'text-orange-600';
          } else if (availabilityPercent > 0) {
            availabilityStatus = 'Low Availability';
            availabilityColor = 'text-yellow-600';
          }
          
          return (
            <Marker
              key={parking._id}
              position={[offsetLat, offsetLng]}
              icon={createParkingIcon(parking.availableSlots, parking.totalSlots)}
            >
              <Popup>
                <div className="min-w-[250px] p-2">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{parking.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{parking.address}</p>
                  
                  {/* Availability Status Badge */}
                  <div className="mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${availabilityColor} bg-opacity-10`}
                      style={{ backgroundColor: availabilityPercent > 50 ? '#dcfce7' : availabilityPercent > 20 ? '#fed7aa' : availabilityPercent > 0 ? '#fef9c3' : '#fee2e2' }}>
                      {availabilityStatus}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm">
                      <span className="font-semibold text-gray-700">Available Slots:</span>{' '}
                      <span className={parking.availableSlots > 0 ? 'text-green-600 font-bold text-lg' : 'text-red-600 font-bold text-lg'}>
                        {parking.availableSlots}
                      </span>
                      <span className="text-gray-500">/{parking.totalSlots}</span>
                    </span>
                    <span className="text-blue-600 font-bold text-lg">₹{parking.pricePerHour}/hr</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${availabilityPercent > 50 ? 'bg-green-600' : availabilityPercent > 20 ? 'bg-orange-500' : availabilityPercent > 0 ? 'bg-yellow-500' : 'bg-red-600'}`}
                        style={{ width: `${availabilityPercent}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">{availabilityPercent.toFixed(0)}% available</p>
                  </div>
                  
                  {parking.availableSlots > 0 ? (
                    <button
                      onClick={() => handleBookNow(parking._id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold transition duration-200 text-sm"
                    >
                      Book Now
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md font-semibold text-sm cursor-not-allowed"
                    >
                      Full - No Slots Available
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Availability Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
            <span className="text-gray-700">High (50%+)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <span className="text-gray-700">Moderate (20-50%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-gray-700">Low (&lt;20%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
            <span className="text-gray-700">Full (0%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
