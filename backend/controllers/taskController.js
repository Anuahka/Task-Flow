const Task = require('../models/Task');
const Board = require('../models/Board');
const { getTaskEstimate } = require('../services/aiService');

// Helper: verify board ownership
const verifyBoardOwnership = async (boardId, userId) => {
  return Board.findOne({ _id: boardId, owner: userId });
};

// @desc    Get all tasks for a board
// @route   GET /api/boards/:boardId/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { sortBy, sortOrder, priority, status } = req.query;

    const board = await verifyBoardOwnership(boardId, req.user._id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found.' });
    }

    const filter = { board: boardId, owner: req.user._id };
    if (priority && ['low', 'med', 'high'].includes(priority)) {
      filter.priority = priority;
    }
    if (status && ['todo', 'in-progress', 'done'].includes(status)) {
      filter.status = status;
    }

    const validSortFields = ['dueDate', 'priority', 'createdAt', 'title', 'order'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'order';
    const sortDir = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(filter).sort({ [sortField]: sortDir });

    res.status(200).json({
      success: true,
      data: { tasks, count: tasks.length },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/boards/:boardId/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      board: req.params.boardId,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a task
// @route   POST /api/boards/:boardId/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    const board = await verifyBoardOwnership(boardId, req.user._id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found.' });
    }

    // Get the highest order in the target status column
    const lastTask = await Task.findOne({
      board: boardId,
      status: req.body.status || 'todo',
    }).sort({ order: -1 }).select('order');

    const order = lastTask ? lastTask.order + 1 : 0;

    // Only allow safe fields
    const { title, description, status, priority, dueDate, estimatedEffort } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      estimatedEffort,
      order,
      board: boardId,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Task created.',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/boards/:boardId/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    // Only allow safe fields to be updated
    const { title, description, status, priority, dueDate, estimatedEffort } = req.body;

    const updateFields = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      estimatedEffort,
    };

    // Remove undefined fields so we don't accidentally nullify them
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] === undefined) delete updateFields[key];
    });

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, board: req.params.boardId, owner: req.user._id },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated.',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/boards/:boardId/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      board: req.params.boardId,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.status(200).json({ success: true, message: 'Task deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Move task to a different status column
// @route   PATCH /api/boards/:boardId/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      board: req.params.boardId,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Place at the bottom of the target column
    const lastTask = await Task.findOne({
      board: req.params.boardId,
      status,
      _id: { $ne: task._id },
    })
      .sort({ order: -1 })
      .select('order');

    task.status = status;
    task.order = lastTask ? lastTask.order + 1 : 0;
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task status updated.',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI effort/due-date estimate for a task
// @route   POST /api/boards/:boardId/tasks/suggest
// @access  Private
const suggestEstimate = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { title, description } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required for AI estimation.',
      });
    }

    const board = await verifyBoardOwnership(boardId, req.user._id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found.' });
    }

    const estimate = await getTaskEstimate(
      String(title).trim(),
      description ? String(description).trim() : ''
    );

    res.status(200).json({
      success: true,
      data: { estimate },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk reorder tasks (drag-and-drop persistence)
// @route   PATCH /api/boards/:boardId/tasks/reorder
// @access  Private
const reorderTasks = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ success: false, message: 'Tasks array is required.' });
    }

    const board = await verifyBoardOwnership(boardId, req.user._id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found.' });
    }

    const bulkOps = tasks
      .filter(({ id }) => id) // skip any items without id
      .map(({ id, order, status }) => ({
        updateOne: {
          filter: { _id: id, board: boardId, owner: req.user._id },
          update: {
            $set: {
              ...(typeof order === 'number' && { order }),
              ...(status && ['todo', 'in-progress', 'done'].includes(status) && { status }),
            },
          },
        },
      }));

    if (bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
    }

    res.status(200).json({ success: true, message: 'Tasks reordered.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  suggestEstimate,
  reorderTasks,
};
