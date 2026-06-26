import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { BOARD_COLORS, extractErrorMessage } from '../../utils/helpers';

const BoardForm = ({ isOpen, onClose, onSubmit, board = null }) => {
  const [form, setForm] = useState({ title: '', description: '', color: '#6366f1' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens or board changes
  useEffect(() => {
    if (!isOpen) return;
    if (board) {
      setForm({
        title: board.title || '',
        description: board.description || '',
        color: board.color || '#6366f1',
      });
    } else {
      setForm({ title: '', description: '', color: '#6366f1' });
    }
    setErrors({});
  }, [board, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.trim().length > 100) errs.title = 'Title cannot exceed 100 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    setErrors({});
    try {
      await onSubmit({ ...form, title: form.title.trim(), description: form.description.trim() });
      onClose();
    } catch (err) {
      setErrors({ submit: extractErrorMessage(err) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={board ? 'Rename board' : 'Create board'} size="sm">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="label" htmlFor="board-title">
            Board name <span className="text-red-500">*</span>
          </label>
          <input
            id="board-title"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={`input ${errors.title ? 'input-error' : ''}`}
            placeholder="e.g. Marketing Campaign"
            autoFocus
            maxLength={100}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="board-desc">Description</label>
          <textarea
            id="board-desc"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input resize-none"
            placeholder="Optional description…"
            rows={2}
            maxLength={500}
          />
        </div>

        <div>
          <label className="label">Accent color</label>
          <div className="flex flex-wrap gap-2">
            {BOARD_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm({ ...form, color })}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                           flex items-center justify-center"
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
                aria-pressed={form.color === color}
              >
                {form.color === color && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                      d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                          rounded-lg px-3 py-2">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
            {isLoading ? 'Saving…' : board ? 'Save changes' : 'Create board'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BoardForm;
