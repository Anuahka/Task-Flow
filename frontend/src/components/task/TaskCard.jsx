import React from 'react';
import { formatDate, isOverdue, PRIORITY_LABELS } from '../../utils/helpers';

const PRIORITY_CLASSES = {
  high: 'badge-high',
  med: 'badge-med',
  low: 'badge-low',
};

const TaskCard = ({ task, onEdit, onDelete, onDragStart, onDragEnd, isDragging = false }) => {
  const dueDateStr = formatDate(task.dueDate);
  const overdue = isOverdue(task.dueDate);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task._id);
        e.dataTransfer.setData('sourceStatus', task.status);
        e.dataTransfer.effectAllowed = 'move';
        if (onDragStart) onDragStart(task);
      }}
      onDragEnd={() => { if (onDragEnd) onDragEnd(); }}
      className={`bg-white dark:bg-slate-800 rounded-lg p-3 shadow-card border border-slate-100
                  dark:border-slate-700 hover:shadow-card-hover transition-all duration-150
                  group cursor-grab active:cursor-grabbing select-none
                  ${isDragging ? 'opacity-40 ring-2 ring-primary-400' : ''}`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <div className="mt-0.5 flex-shrink-0 text-slate-300 dark:text-slate-600">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-900 dark:text-white leading-snug line-clamp-2">
            {task.title}
          </h4>
          {task.description && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400
                       hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Edit task"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0
                   112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(task); }}
            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400
                       hover:text-red-500 transition-colors"
            aria-label="Delete task"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5
                   4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
        <span className={PRIORITY_CLASSES[task.priority] || 'badge-med'}>
          {PRIORITY_LABELS[task.priority] || 'Medium'}
        </span>

        {task.estimatedEffort && (
          <span className="badge bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
            {task.estimatedEffort}
          </span>
        )}

        {dueDateStr && (
          <span className={`badge ${
            overdue
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
          }`}>
            <svg className="w-3 h-3 mr-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {overdue && <span className="mr-0.5">⚠</span>}{dueDateStr}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
