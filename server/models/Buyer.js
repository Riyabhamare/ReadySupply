import mongoose from 'mongoose';

const buyerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Buyer name is required'],
      trim: true,
    },
    sector: {
      type: String,
      required: [true, 'Buyer sector is required'],
      trim: true,
    },
    location: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      default: '',
    },
    isFictionalSample: {
      type: Boolean,
      default: true,
    },
    isDemo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Buyer = mongoose.model('Buyer', buyerSchema);

