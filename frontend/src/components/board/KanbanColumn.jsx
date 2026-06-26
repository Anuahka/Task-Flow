import React, { useState } from 'react';
import TaskCard from '../task/TaskCard';
import { TaskCardSkeleton } from '../ui/Skeleton';

const COLUMN_CONFIG = {
  todo: {
    label: 'To Do',
    dot: 'bg-slate-400 dark:bg-slate-500',
    headerBg: 'bg-slate-50 dark:bg-slate-800/60',
    border: 'border-slate-200 dark:border-slate-700',
    dropBg: 'bg-slate-100/80 dark:bg-slate-700/40',
  },
  'in-progress': {
    label: 'In Progress',
    dot: 'bg-blue-500',
    headerBg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    dropBg: 'bg-blue-50/80 dark:bg-blue-900/20',
  },
  done: {
    label: 'Done',
    dot: 'bg-emerald-500',
    headerBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    dropBg: 'bg-emerald-50/80 dark:bg-emerald-900/20',
  },
};

const KanbanColumn = ({
  status,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDropTask,
  onDragStart,
  onDragEnd,
  draggingTaskId,
  isLoading,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const config = COLUMN_CONFIG[status];

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    const sourceStatus = e.dataTransfer.getData('sourceStatus');
    if (taskId && onDropTask) {
      onDropTask(taskId, sourceStatus, status);
    }
  };

  return (
    <div className="flex-shrink-0 w-72 flex flex-col">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl border
                       ${config.border} ${config.headerBg}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {config.label}
          </span>
          <span className="ml-1 text-xs font-medium text-slate-400 dark:text-slate-500
                           bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-full
                           border border-slate-200 dark:border-slate-700 tabular-nums">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700
                     text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                     transition-colors"
          aria-label={`Add task to ${config.label}`}
          title="Add task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 min-h-[200px] p-2 space-y-2 rounded-b-xl border-l border-r border-b
                    transition-colors duration-150 ${config.border}
                    ${isDragOver
                      ? `${config.dropBg} ring-2 ring-inset ring-primary-300 dark:ring-primary-700`
                      : 'bg-slate-50/50 dark:bg-slate-800/20'
                    }`}
      >
        {isLoading ? (
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
        ) : (
          <>
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                isDragging={draggingTaskId === task._id}
              />
            ))}

            {tasks.length === 0 && !isDragOver && (
              <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                <div className={`w-9 h-9 rounded-xl ${config.headerBg} border ${config.border}
                                flex items-center justify-center mb-2`}>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">No tasks yet</p>
                <button
                  onClick={() => onAddTask(status)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Add one
                </button>
              </div>
            )}

            {isDragOver && (
              <div className="h-16 rounded-lg border-2 border-dashed border-primary-400
                              dark:border-primary-600 flex items-center justify-center
                              bg-primary-50/50 dark:bg-primary-900/10">
                <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                  Drop here
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
