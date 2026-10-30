import { RequirementTemplate } from '../models/RequirementTemplate.js';
import { Buyer } from '../models/Buyer.js';
import { ROLES } from '../config/constants.js';

export const getTemplates = async (req, res, next) => {
  try {
    const templates = await RequirementTemplate.find().populate('buyer').sort({ name: 1 });
    res.json(templates);
  } catch (err) {
    next(err);
  }
};

export const getTemplateById = async (req, res, next) => {
  try {
    const template = await RequirementTemplate.findById(req.params.id).populate('buyer');
    if (!template) {
      return res.status(404).json({ error: 'NotFound', message: 'Template not found' });
    }
    res.json(template);
  } catch (err) {
    next(err);
  }
};

export const createTemplate = async (req, res, next) => {
  try {
    const { buyerId, name, version, description, sector, requirements } = req.body;

    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return res.status(400).json({ error: 'BadRequest', message: 'Valid buyer ID is required.' });
    }

    const template = await RequirementTemplate.create({
      buyer: buyer._id,
      name,
      version: version || '1.0',
      description: description || '',
      sector: sector || buyer.sector,
      requirements: requirements || [],
      isDemo: false,
    });

    res.status(201).json({
      message: 'Template created successfully',
      template,
    });
  } catch (err) {
    next(err);
  }
};

