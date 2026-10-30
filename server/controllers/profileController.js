import { z } from 'zod';
import { SupplierProfile } from '../models/SupplierProfile.js';
import { logActivity } from '../services/activityService.js';

const updateProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name is required').optional(),
  description: z.string().optional(),
  udyamNumber: z.string().regex(/^$|^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/, 'Enter a valid Udyam number (e.g., UDYAM-MH-12-0012345)').optional(),
  gstNumber: z.string().regex(/^$|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Enter a valid 15-character GSTIN').optional(),
  industryCategory: z.string().optional(),
  manufacturingSector: z.string().min(2).optional(),
  location: z.object({
    state: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
  contact: z.object({
    personName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    designation: z.string().optional(),
  }).optional(),
  productsManufactured: z.array(z.string()).optional(),
  manufacturingCapabilities: z.array(z.string()).optional(),
  machineryRoster: z.array(
    z.object({
      _id: z.string().optional(),
      name: z.string(),
      type: z.string(),
      quantity: z.number().min(1),
      keySpec: z.string().optional(),
    })
  ).optional(),
  monthlyCapacity: z.string().optional(),
  qcEquipment: z.array(z.string()).optional(),
  employeeCount: z.number().min(0).optional(),
});

export const getProfile = async (req, res, next) => {
  try {
    let profile = await SupplierProfile.findOne({ supplier: req.user._id });
    if (!profile) {
      profile = await SupplierProfile.create({
        supplier: req.user._id,
        companyName: req.user.name || 'My Enterprise',
      });
      profile.calculateCompleteness();
      await profile.save();
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    let profile = await SupplierProfile.findOne({ supplier: req.user._id });
    if (!profile) {
      profile = new SupplierProfile({ supplier: req.user._id });
    }

    Object.assign(profile, data);
    profile.calculateCompleteness();
    await profile.save();

    await logActivity({
      supplierId: req.user._id,
      performedById: req.user._id,
      action: 'UPDATE_PROFILE',
      entityType: 'SupplierProfile',
      entityId: profile._id.toString(),
      ip: req.ip,
    });

    res.json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (err) {
    next(err);
  }
};

