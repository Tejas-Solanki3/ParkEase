import cron from 'node-cron';
import Booking from '../models/Booking.js';
import ParkingLot from '../models/ParkingLot.js';

// Function to check and update expired bookings
const checkExpiredBookings = async () => {
  try {
    const now = new Date();
    
    // Find all active or extended bookings that have passed their end time
    const expiredBookings = await Booking.find({
      status: { $in: ['active', 'extended'] },
      endTime: { $lt: now } // endTime less than current time
    });

    if (expiredBookings.length > 0) {
      console.log(`Found ${expiredBookings.length} expired booking(s). Updating...`);

      for (const booking of expiredBookings) {
        // Update booking status to completed
        booking.status = 'completed';
        await booking.save();

        // Free up the parking slot
        const parkingLot = await ParkingLot.findById(booking.parkingLot);
        if (parkingLot) {
          const slot = parkingLot.slots.find(s => s.slotNumber === booking.slotNumber);
          if (slot && slot.status === 'booked') {
            slot.status = 'available';
            await parkingLot.save();
            console.log(`✓ Freed slot ${booking.slotNumber} at ${parkingLot.name}`);
          }
        }

        console.log(`✓ Booking ${booking._id} marked as completed`);
      }
    }
  } catch (error) {
    console.error('Error checking expired bookings:', error);
  }
};

// Schedule the job to run every minute
const startBookingScheduler = () => {
  // Run every minute: * * * * *
  cron.schedule('* * * * *', () => {
    checkExpiredBookings();
  });

  console.log(' Booking expiration scheduler started (runs every minute)');
  
  // Run once immediately on startup
  checkExpiredBookings();
};

export { checkExpiredBookings };
export default startBookingScheduler;
