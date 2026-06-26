const { body } = require('express-validator');

const boardValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Board title is required')
    .isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color (e.g. #6366f1)'),
];

module.exports = { boardValidator };
