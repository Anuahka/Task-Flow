const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: 'Status must be todo, in-progress, or done',
      },
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'med', 'high'],
        message: 'Priority must be low, med, or high',
      },
      default: 'med',
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimatedEffort: {
      type: String,
      trim: true,
      maxlength: [100, 'Effort estimate cannot exceed 100 characters'],
      default: '',
    },
    aiSuggestion: {
      effort: { type: String, default: '' },
      dueDate: { type: Date, default: null },
      reasoning: { type: String, default: '' },
      generatedAt: { type: Date, default: null },
    },
    order: {
      type: Number,
      default: 0,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
taskSchema.index({ board: 1, status: 1, order: 1 });
taskSchema.index({ board: 1, priority: 1 });
taskSchema.index({ board: 1, dueDate: 1 });
taskSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
