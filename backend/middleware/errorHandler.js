// Custom error class for API errors
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

// 404 Not Found handler
const notFound = (req, res, next) => {
    const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
    next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    
    // Log error for debugging
    console.error('❌ Error:', {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode
    });
    
    // Handle specific PostgreSQL errors
    if (err.code === '23505') { // Unique violation
        const message = 'Duplicate entry. This record already exists.';
        error = new AppError(message, 400);
    }
    
    if (err.code === '23503') { // Foreign key violation
        const message = 'Related record not found.';
        error = new AppError(message, 400);
    }
    
    if (err.code === '42P01') { // Table doesn't exist
        const message = 'Database table not found. Please run migrations.';
        error = new AppError(message, 500);
    }
    
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please login again.';
        error = new AppError(message, 401);
    }
    
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired. Please login again.';
        error = new AppError(message, 401);
    }
    
    // Handle validation errors from Joi
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new AppError(message, 400);
    }
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode: statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = {
    AppError,
    notFound,
    errorHandler
};