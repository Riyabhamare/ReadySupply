import mongoose from 'mongoose';

const machinerySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    keySpec: { type: String, default: '' },
  },
  { _id: true }
);

const supplierProfileSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    udyamNumber: {
      type: String,
      trim: true,
      default: '',
    },
    gstNumber: {
      type: String,
      trim: true,
      default: '',
    },
    industryCategory: {
      type: String,
      default: 'Manufacturing',
    },
    manufacturingSector: {
      type: String,
      required: true,
      default: 'Automotive & Precision Machining',
    },
    location: {
      state: { type: String, default: 'Maharashtra' },
      city: { type: String, default: '' },
      address: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    contact: {
      personName: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      designation: { type: String, default: 'Proprietor / Managing Partner' },
    },
    productsManufactured: [{ type: String }],
    manufacturingCapabilities: [{ type: String }],
    machineryRoster: [machinerySchema],
    monthlyCapacity: {
      type: String,
      default: '',
    },
    qcEquipment: [{ type: String }],
    employeeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    profileCompleteness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate completeness percentage
supplierProfileSchema.methods.calculateCompleteness = function () {
  let score = 0;
  if (this.companyName) score += 10;
  if (this.udyamNumber) score += 10;
  if (this.gstNumber) score += 10;
  if (this.manufacturingSector) score += 10;
  if (this.location && this.location.city && this.location.address) score += 10;
  if (this.contact && this.contact.personName && this.contact.phone) score += 10;
  if (this.productsManufactured && this.productsManufactured.length > 0) score += 10;
  if (this.manufacturingCapabilities && this.manufacturingCapabilities.length > 0) score += 10;
  if (this.machineryRoster && this.machineryRoster.length > 0) score += 10;
  if (this.qcEquipment && this.qcEquipment.length > 0) score += 10;
  this.profileCompleteness = Math.min(100, score);
  return this.profileCompleteness;
};

export const SupplierProfile = mongoose.model('SupplierProfile', supplierProfileSchema);

