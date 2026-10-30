import { ROLES } from '../config/constants.js';

/**
 * Checks that the authenticated user owns the resource or is an admin.
 * If user is a supplier and does not own the resource, responds with 403 Forbidden.
 * If resource does not exist, responds with 404 Not Found.
 */
export const checkOwnership = (Model, paramKey = 'id', ownerField = 'supplier') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramKey];
      if (!resourceId) {
        return res.status(400).json({ error: 'BadRequest', message: `Missing parameter: ${paramKey}` });
      }

      const resource = await Model.findById(resourceId);
      if (!resource) {
        return res.status(404).json({ error: 'NotFound', message: 'Resource not found' });
      }

      // Admins bypass ownership checks for review/system administration
      if (req.user.role === ROLES.ADMIN) {
        req.resource = resource;
        return next();
      }

      // Check owner ID
      const ownerId = resource[ownerField] ? resource[ownerField].toString() : null;
      const currentUserId = req.user._id.toString();

      if (ownerId !== currentUserId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied: You do not have permission to access or modify this resource.',
        });
      }

      req.resource = resource;
      next();
    } catch (err) {
      next(err);
    }
  };
};

