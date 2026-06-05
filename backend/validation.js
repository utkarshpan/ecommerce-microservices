const Joi = require('joi');

// User Signup Validation
const validateSignup = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).optional(),
        email: Joi.string().email().required().messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(6).max(100).required().messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        })
    });
    return schema.validate(data);
};

// User Login Validation
const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().required().messages({
            'any.required': 'Password is required'
        })
    });
    return schema.validate(data);
};

// Product Validation
const validateProduct = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100).required().messages({
            'string.min': 'Product name must be at least 2 characters',
            'any.required': 'Product name is required'
        }),
        price: Joi.number().positive().min(0.01).required().messages({
            'number.positive': 'Price must be a positive number',
            'any.required': 'Price is required'
        }),
        stock: Joi.number().integer().min(0).required().messages({
            'number.integer': 'Stock must be a whole number',
            'number.min': 'Stock cannot be negative',
            'any.required': 'Stock is required'
        }),
        category: Joi.string().optional()
    });
    return schema.validate(data);
};

// Order Validation
const validateOrder = (data) => {
    const schema = Joi.object({
        items: Joi.array().min(1).required().messages({
            'array.min': 'Cart cannot be empty',
            'any.required': 'Items are required'
        }),
        total_amount: Joi.number().positive().required(),
        shipping_address: Joi.string().min(5).max(200).required().messages({
            'string.min': 'Shipping address must be at least 5 characters',
            'any.required': 'Shipping address is required'
        }),
        shipping_city: Joi.string().min(2).max(50).required(),
        shipping_zip: Joi.string().min(3).max(10).required(),
        phone: Joi.string().min(10).max(15).required().pattern(/^[0-9]+$/).messages({
            'string.pattern.base': 'Phone number must contain only digits',
            'string.min': 'Phone number must be at least 10 digits'
        })
    });
    return schema.validate(data);
};

// Profile Update Validation
const validateProfile = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required().messages({
            'string.min': 'Name must be at least 2 characters',
            'any.required': 'Name is required'
        })
    });
    return schema.validate(data);
};

module.exports = {
    validateSignup,
    validateLogin,
    validateProduct,
    validateOrder,
    validateProfile
};