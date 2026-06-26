const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  suggestEstimate,
  reorderTasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { taskValidator, updateStatusValidator } = require('../validators/taskValidators');
const { validate } = require('../middleware/validate');

router.use(protect);

// POST /api/boards/:boardId/tasks/suggest
router.post('/suggest', suggestEstimate);

// PATCH /api/boards/:boardId/tasks/reorder
router.patch('/reorder', reorderTasks);

// GET /api/boards/:boardId/tasks
// POST /api/boards/:boardId/tasks
router.route('/').get(getTasks).post(taskValidator, validate, createTask);

// GET /api/boards/:boardId/tasks/:id
// PUT /api/boards/:boardId/tasks/:id
// DELETE /api/boards/:boardId/tasks/:id
router
  .route('/:id')
  .get(getTask)
  .put(taskValidator, validate, updateTask)
  .delete(deleteTask);

// PATCH /api/boards/:boardId/tasks/:id/status
router.patch('/:id/status', updateStatusValidator, validate, updateTaskStatus);

module.exports = router;
