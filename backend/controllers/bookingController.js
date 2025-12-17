import Booking from '../models/Booking.js';
import ParkingLot from '../models/ParkingLot.js';
import Payment from '../models/Payment.js';

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const { parkingLotId, slotNumber, duration, vehicleNumber } = req.body;

    // Validation
    if (!parkingLotId || !slotNumber || !duration) {
      return res.status(400).json({ message: 'Please provide all required fields (parkingLotId, slotNumber, duration)' });
    }

    // Vehicle number is recommended but not strictly required (for backward compatibility)
    if (!vehicleNumber) {
      console.warn('Warning: Booking created without vehicle number');
    }

    // Find parking lot
    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    // Find slot
    const slot = parkingLot.slots.find(s => s.slotNumber === slotNumber);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.status === 'booked') {
      return res.status(400).json({ message: 'Slot is already booked' });
    }

    // Calculate times and amount
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    const totalAmount = parkingLot.pricePerHour * duration;

    // Create booking
    const bookingData = {
      user: req.user._id,
      parkingLot: parkingLotId,
      slotNumber,
      startTime,
      endTime,
      duration,
      totalAmount,
      status: 'active'
    };

    // Add vehicle number if provided
    if (vehicleNumber) {
      bookingData.vehicleNumber = vehicleNumber.trim().toUpperCase();
    }

    const booking = await Booking.create(bookingData);

    // Update slot status
    slot.status = 'booked';
    await parkingLot.save();

    // Populate booking data
    await booking.populate('parkingLot', 'name address');
    await booking.populate('user', 'name email');

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/user/:id
// @access  Private
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.id })
      .populate('parkingLot', 'name address pricePerHour')
      .sort('-createdAt');
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('parkingLot', 'name address')
      .sort('-createdAt');
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Extend booking
// @route   PUT /api/bookings/:id/extend
// @access  Private
export const extendBooking = async (req, res) => {
  try {
    const { additionalHours } = req.body;

    if (!additionalHours || additionalHours <= 0) {
      return res.status(400).json({ message: 'Please provide valid additional hours' });
    }

    const booking = await Booking.findById(req.params.id).populate('parkingLot');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'active') {
      return res.status(400).json({ message: 'Can only extend active bookings' });
    }

    // Update booking
    booking.endTime = new Date(booking.endTime.getTime() + additionalHours * 60 * 60 * 1000);
    booking.duration += additionalHours;
    booking.totalAmount += booking.parkingLot.pricePerHour * additionalHours;
    booking.status = 'extended';

    await booking.save();
    await booking.populate('parkingLot', 'name address');

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Update slot status
    const parkingLot = await ParkingLot.findById(booking.parkingLot);
    if (parkingLot) {
      const slot = parkingLot.slots.find(s => s.slotNumber === booking.slotNumber);
      if (slot) {
        slot.status = 'available';
        await parkingLot.save();
      }
    }

    await booking.populate('parkingLot', 'name address');
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('parkingLot', 'name address pricePerHour');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
