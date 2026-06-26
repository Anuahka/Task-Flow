import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { taskService } from '../../services/taskService';
import { extractErrorMessage, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'med', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const emptyForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'med',
  dueDate: '',
  estimatedEffort: '',
};

const TaskForm = ({ isOpen, onClose, onSubmit, task = null, boardId, defaultStatus = 'todo' }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'med',
        // Parse ISO date string to YYYY-MM-DD for input[type=date]
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        estimatedEffort: task.estimatedEffort || '',
      });
    } else {
      setForm({ ...emptyForm, status: defaultStatus });
    }
    setErrors({});
    setAiSuggestion(null);
  }, [task, isOpen, defaultStatus]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.length > 200) errs.title = 'Title cannot exceed 200 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      const payload = { ...form, dueDate: form.dueDate || null };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrors({ submit: extractErrorMessage(err) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestEstimate = async () => {
    if (!form.title.trim()) {
      setErrors((prev) => ({ ...prev, title: 'Enter a title before requesting an estimate' }));
      return;
    }
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await taskService.suggestEstimate(boardId, {
        title: form.title,
        description: form.description,
      });
      setAiSuggestion(res.data.estimate);
    } catch {
      toast.error('AI estimate unavailable — please try again later.');
    } finally {
      setAiLoading(false);
    }
  };

  const acceptSuggestion = () => {
    if (!aiSuggestion) return;
    setForm((prev) => ({
      ...prev,
      estimatedEffort: aiSuggestion.effort || prev.estimatedEffort,
      // suggestedDueDate is YYYY-MM-DD from the API
      dueDate: aiSuggestion.suggestedDueDate
        ? aiSuggestion.suggestedDueDate.split('T')[0]
        : prev.dueDate,
    }));
    setAiSuggestion(null);
    toast.success('AI suggestion applied!');
  };

  const Spinner = () => (
    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit task' : 'New task'} size="md">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Title */}
        <div>
          <label className="label" htmlFor="task-title">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={`input ${errors.title ? 'input-error' : ''}`}
            placeholder="What needs to be done?"
            autoFocus
            maxLength={200}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="label" htmlFor="task-desc">Description</label>
          <textarea
            id="task-desc"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input resize-none"
            placeholder="Add more details…"
            rows={3}
            maxLength={2000}
          />
        </div>

        {/* Status + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="task-status">Status</label>
            <select
              id="task-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="input"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due date + Effort */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="task-due">Due date</label>
            <input
              id="task-due"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="task-effort">Effort estimate</label>
            <input
              id="task-effort"
              type="text"
              value={form.estimatedEffort}
              onChange={(e) => setForm({ ...form, estimatedEffort: e.target.value })}
              className="input"
              placeholder="e.g. M (4–8 hours)"
              maxLength={100}
            />
          </div>
        </div>

        {/* AI Suggest panel */}
        <div className="rounded-xl border border-dashed border-violet-300 dark:border-violet-700
                        bg-violet-50 dark:bg-violet-900/10 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.343-5.657l-.707-.707
                       m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531
                       c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-violet-700 dark:text-violet-400">
                AI Smart Estimate
              </span>
            </div>
            <button
              type="button"
              onClick={handleSuggestEstimate}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50
                         transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {aiLoading ? <><Spinner /> Thinking…</> : 'Suggest estimate'}
            </button>
          </div>

          {aiSuggestion ? (
            <div className="space-y-2">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 space-y-1.5 text-xs
                              border border-violet-200 dark:border-violet-800">
                <div className="flex gap-2 items-start">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 w-16 flex-shrink-0">
                    Effort:
                  </span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {aiSuggestion.effort}
                  </span>
                </div>
                {aiSuggestion.suggestedDueDate && (
                  <div className="flex gap-2 items-start">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 w-16 flex-shrink-0">
                      Due date:
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      {formatDate(aiSuggestion.suggestedDueDate) || aiSuggestion.suggestedDueDate}
                    </span>
                  </div>
                )}
                {aiSuggestion.reasoning && (
                  <div className="flex gap-2 items-start">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 w-16 flex-shrink-0">
                      Why:
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 italic">
                      {aiSuggestion.reasoning}
                    </span>
                  </div>
                )}
                {aiSuggestion.isFallback && (
                  <p className="text-amber-600 dark:text-amber-400 text-xs pt-1 border-t
                                border-amber-200 dark:border-amber-800 mt-1">
                    ⚠ AI unavailable — showing default estimate
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={acceptSuggestion}
                  className="btn btn-sm btn-primary flex-1"
                >
                  Accept suggestion
                </button>
                <button
                  type="button"
                  onClick={() => setAiSuggestion(null)}
                  className="btn btn-sm btn-secondary"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-violet-600 dark:text-violet-400">
              Enter a title, then click "Suggest estimate" for an AI-powered effort and due date recommendation.
            </p>
          )}
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
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner /> Saving…
              </span>
            ) : task ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
