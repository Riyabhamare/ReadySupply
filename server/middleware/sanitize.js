/**
 * Strips MongoDB operators ($ and .) recursively from inputs to prevent injection attacks.
 */
function sanitizeObject(target) {
  if (!target || typeof target !== 'object') {
    return target;
  }

  if (Array.isArray(target)) {
    return target.map(sanitizeObject);
  }

  const clean = {};
  for (const [key, value] of Object.entries(target)) {
    // Drop keys starting with $ or containing .
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    clean[key] = typeof value === 'object' && value !== null ? sanitizeObject(value) : value;
  }
  return clean;
}

export const mongoSanitizer = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

