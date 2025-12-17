import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'booked'],
    default: 'available'
  }
});

const parkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Parking lot name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  totalSlots: {
    type: Number,
    required: [true, 'Total slots is required'],
    min: 1
  },
  slots: [slotSchema],
  pricePerHour: {
    type: Number,
    required: [true, 'Price per hour is required'],
    min: 0
  },
  availableSlots: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate available slots before saving
parkingLotSchema.pre('save', function(next) {
  this.availableSlots = this.slots.filter(slot => slot.status === 'available').length;
  next();
});

const ParkingLot = mongoose.model('ParkingLot', parkingLotSchema);

export default ParkingLot;
