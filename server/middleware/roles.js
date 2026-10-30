import { ROLES } from '../config/constants.js';

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required before checking roles.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Role "${req.user.role}" does not have permission to access this resource.`,
      });
    }

    next();
  };
};

export const requireAdmin = requireRole([ROLES.ADMIN]);
export const requireSupplier = requireRole([ROLES.SUPPLIER]);

