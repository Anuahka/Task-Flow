const express = require('express');
const router = express.Router();
const {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
} = require('../controllers/boardController');
const { protect } = require('../middleware/auth');
const { boardValidator } = require('../validators/boardValidators');
const { validate } = require('../middleware/validate');

router.use(protect);

// GET /api/boards
// POST /api/boards
router.route('/').get(getBoards).post(boardValidator, validate, createBoard);

// GET /api/boards/:id
// PUT /api/boards/:id
// DELETE /api/boards/:id
router
  .route('/:id')
  .get(getBoard)
  .put(boardValidator, validate, updateBoard)
  .delete(deleteBoard);

module.exports = router;
