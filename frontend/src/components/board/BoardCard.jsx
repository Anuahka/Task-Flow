import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import ConfirmDialog from '../ui/ConfirmDialog';

const BoardCard = ({ board, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(board._id);
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  const taskCount = typeof board.taskCount === 'number' ? board.taskCount : 0;

  const timeAgo = board.createdAt
    ? formatDistanceToNow(new Date(board.createdAt), { addSuffix: true })
    : null;

  return (
    <>
      <div
        className="card p-5 hover:shadow-card-hover transition-all duration-200 cursor-pointer
                   group relative overflow-hidden"
        onClick={() => navigate(`/board/${board._id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/board/${board._id}`)}
        aria-label={`Open board: ${board.title}`}
      >
        {/* Colour accent stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: board.color || '#6366f1' }}
        />

        <div className="flex items-start justify-between mt-1">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate
                           group-hover:text-primary-600 dark:group-hover:text-primary-400
                           transition-colors">
              {board.title}
            </h3>
            {board.description && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {board.description}
              </p>
            )}
          </div>

          {/* Options menu — always visible (mobile-friendly) */}
          <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800
                         transition-all text-slate-400 hover:text-slate-600
                         dark:hover:text-slate-300"
              aria-label="Board options"
              aria-expanded={showMenu}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 w-36 bg-white dark:bg-slate-900 rounded-lg
                                shadow-modal border border-slate-100 dark:border-slate-800
                                z-20 animate-scale-in py-1">
                  <button
                    onClick={() => { setShowMenu(false); onEdit(board); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700
                               dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800
                               transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                           m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Rename
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); setShowDelete(true); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600
                               dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                               transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7
                           m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                   M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </span>
          {timeAgo && (
            <span className="text-xs text-slate-400 dark:text-slate-500">{timeAgo}</span>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete board?"
        message={`"${board.title}" and all its tasks will be permanently deleted. This cannot be undone.`}
        isLoading={isDeleting}
      />
    </>
  );
};

export default BoardCard;
