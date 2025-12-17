import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';

// @desc    Process payment (simulated)
// @route   POST /api/payments
// @access  Private
export const processPayment = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    // Validation
    if (!bookingId || !amount) {
      return res.status(400).json({ message: 'Please provide booking ID and amount' });
    }

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Generate simulated transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record (always success - simulated)
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      amount,
      paymentMethod: 'simulated',
      status: 'success',
      transactionId
    });

    // Update booking with payment ID
    booking.paymentId = payment._id;
    await booking.save();

    res.status(201).json({
      message: 'Payment successful',
      payment,
      transactionId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user payments
// @route   GET /api/payments/user/:userId
// @access  Private
export const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.params.userId })
      .populate('booking')
      .sort('-createdAt');

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
