import { Buyer } from '../models/Buyer.js';

export const getBuyers = async (req, res, next) => {
  try {
    const buyers = await Buyer.find().sort({ name: 1 });
    res.json(buyers);
  } catch (err) {
    next(err);
  }
};

export const getBuyerById = async (req, res, next) => {
  try {
    const buyer = await Buyer.findById(req.params.id);
    if (!buyer) {
      return res.status(404).json({ error: 'NotFound', message: 'Buyer not found' });
    }
    res.json(buyer);
  } catch (err) {
    next(err);
  }
};

