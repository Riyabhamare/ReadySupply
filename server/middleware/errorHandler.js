import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  // Check for Multer upload errors or file filter rejections
  if (err.name === 'MulterError' || err.message?.includes('file type') || err.message?.includes('File too large')) {
    return res.status(400).json({
      error: 'UploadError',
      message: err.message,
    });
  }

  // Check for Zod validation errors
  if (err.name === 'ZodError' || err.errors) {
    const details = err.issues || err.errors;
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid request data',
      details,
    });
  }

  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  const response = {
    error: err.name || 'ServerError',
    message: err.message || 'An unexpected internal server error occurred.',
  };

  // Include stack only in development mode
  if (env.NODE_ENV === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
