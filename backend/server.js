import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import startBookingScheduler from './utils/bookingScheduler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import parkingRoutes from './routes/parkingRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import issueRoutes from './routes/issueRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Start booking expiration scheduler
startBookingScheduler();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/issues', issueRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ParkEase API' });
});

// Manual trigger for booking expiration check (for testing)
app.post('/api/admin/check-expired-bookings', async (req, res) => {
  try {
    const { checkExpiredBookings } = await import('./utils/bookingScheduler.js');
    await checkExpiredBookings();
    res.json({ message: 'Expired bookings check completed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
