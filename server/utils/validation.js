// Input validation utilities

/**
 * Validate email format with comprehensive regex
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;

    // Comprehensive email regex that handles most valid formats
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    return emailRegex.test(email) && email.length <= 254; // Max email length per RFC 5321
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - {valid: boolean, message: string}
 */
const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password is required' };
    }

    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    if (password.length > 128) {
        return { valid: false, message: 'Password must be less than 128 characters' };
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    // Check for at least one number
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }

    return { valid: true, message: 'Password is strong' };
};

/**
 * Validate name
 * @param {string} name - Name to validate
 * @returns {object} - {valid: boolean, message: string}
 */
const validateName = (name) => {
    if (!name || typeof name !== 'string') {
        return { valid: false, message: 'Name is required' };
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
        return { valid: false, message: 'Name must be at least 2 characters long' };
    }

    if (trimmedName.length > 100) {
        return { valid: false, message: 'Name must be less than 100 characters' };
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
        return { valid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }

    return { valid: true, message: 'Name is valid', sanitized: trimmedName };
};

/**
 * Sanitize user input to prevent XSS and injection attacks
 * @param {string} input - Input to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized input
 */
const sanitizeInput = (input, maxLength = 255) => {
    if (!input || typeof input !== 'string') return '';

    // Trim whitespace and limit length
    let sanitized = input.trim().substring(0, maxLength);

    // Remove potential HTML/script tags
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

    return sanitized;
};

/**
 * Sanitize email specifically
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email in lowercase
 */
const sanitizeEmail = (email) => {
    if (!email || typeof email !== 'string') return '';
    return email.toLowerCase().trim();
};

module.exports = {
    isValidEmail,
    validatePassword,
    validateName,
    sanitizeInput,
    sanitizeEmail
};
