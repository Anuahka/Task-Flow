const { body } = require('express-validator');

const taskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done'),

  body('priority')
    .optional()
    .isIn(['low', 'med', 'high']).withMessage('Priority must be low, med, or high'),

  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value === '') return true;
      if (isNaN(Date.parse(value))) throw new Error('Invalid due date');
      return true;
    }),

  body('estimatedEffort')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Effort estimate cannot exceed 100 characters'),
];

const updateStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done'),
];

module.exports = { taskValidator, updateStatusValidator };
