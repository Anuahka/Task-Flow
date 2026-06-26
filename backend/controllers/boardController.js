const Board = require('../models/Board');
const Task = require('../models/Task');

// @desc    Get all boards for current user
// @route   GET /api/boards
// @access  Private
const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({ owner: req.user._id })
      .populate('taskCount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { boards, count: boards.length },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single board
// @route   GET /api/boards/:id
// @access  Private
const getBoard = async (req, res, next) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { board },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a board
// @route   POST /api/boards
// @access  Private
const createBoard = async (req, res, next) => {
  try {
    const { title, description, color } = req.body;

    const board = await Board.create({
      title,
      description,
      color,
      owner: req.user._id,
    });

    // Populate taskCount (will be 0 for a new board)
    await board.populate('taskCount');

    res.status(201).json({
      success: true,
      message: 'Board created.',
      data: { board },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a board
// @route   PUT /api/boards/:id
// @access  Private
const updateBoard = async (req, res, next) => {
  try {
    const { title, description, color } = req.body;

    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { title, description, color },
      { new: true, runValidators: true }
    ).populate('taskCount');

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Board updated.',
      data: { board },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a board (and all its tasks)
// @route   DELETE /api/boards/:id
// @access  Private
const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found.',
      });
    }

    // Cascade delete all tasks belonging to this board
    await Task.deleteMany({ board: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Board and all its tasks deleted.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBoards, getBoard, createBoard, updateBoard, deleteBoard };
