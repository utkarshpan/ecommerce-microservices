// Standard success response formatter
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

// Standard error response formatter
const errorResponse = (res, message = 'Error occurred', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        error: message,
        statusCode,
        timestamp: new Date().toISOString()
    };
    
    if (errors) {
        response.errors = errors;
    }
    
    res.status(statusCode).json(response);
};

module.exports = {
    successResponse,
    errorResponse
};