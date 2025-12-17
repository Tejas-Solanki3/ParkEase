import ParkingLot from '../models/ParkingLot.js';
import Booking from '../models/Booking.js';

// @desc    Get all parking lots
// @route   GET /api/parking
// @access  Public
export const getParkingLots = async (req, res) => {
  try {
    const parkingLots = await ParkingLot.find().sort('-createdAt');
    res.json(parkingLots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single parking lot
// @route   GET /api/parking/:id
// @access  Public
export const getParkingLotById = async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);
    
    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }
    
    res.json(parkingLot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create parking lot
// @route   POST /api/parking
// @access  Private/Admin
export const createParkingLot = async (req, res) => {
  try {
    const { name, address, totalSlots, pricePerHour } = req.body;

    // Validation
    if (!name || !address || !totalSlots || !pricePerHour) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Create slots array
    const slots = [];
    for (let i = 1; i <= totalSlots; i++) {
      slots.push({
        slotNumber: `A${i.toString().padStart(3, '0')}`,
        status: 'available'
      });
    }

    const parkingLot = await ParkingLot.create({
      name,
      address,
      totalSlots,
      slots,
      pricePerHour,
      availableSlots: totalSlots
    });

    res.status(201).json(parkingLot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update parking lot
// @route   PUT /api/parking/:id
// @access  Private/Admin
export const updateParkingLot = async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);

    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    const { name, address, pricePerHour } = req.body;

    parkingLot.name = name || parkingLot.name;
    parkingLot.address = address || parkingLot.address;
    parkingLot.pricePerHour = pricePerHour || parkingLot.pricePerHour;

    const updatedParkingLot = await parkingLot.save();
    res.json(updatedParkingLot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete parking lot
// @route   DELETE /api/parking/:id
// @access  Private/Admin
export const deleteParkingLot = async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);

    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    // Check if there are active bookings
    const activeBookings = await Booking.find({
      parkingLot: req.params.id,
      status: 'active'
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete parking lot with active bookings' 
      });
    }

    await parkingLot.deleteOne();
    res.json({ message: 'Parking lot removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
