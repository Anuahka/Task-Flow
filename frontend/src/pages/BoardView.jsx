import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { boardService } from '../services/boardService';
import { taskService } from '../services/taskService';
import Navbar from '../components/layout/Navbar';
import KanbanColumn from '../components/board/KanbanColumn';
import FilterBar from '../components/board/FilterBar';
import TaskForm from '../components/task/TaskForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { BoardViewSkeleton } from '../components/ui/Skeleton';
import { extractErrorMessage, PRIORITY_ORDER } from '../utils/helpers';
import toast from 'react-hot-toast';

const STATUSES = ['todo', 'in-progress', 'done'];
const DEFAULT_FILTERS = { priority: '', sortBy: 'order', sortOrder: 'asc', search: '' };

const BoardView = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draggingTaskId, setDraggingTaskId] = useState(null);

  const [taskForm, setTaskForm] = useState({ open: false, task: null, defaultStatus: 'todo' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, task: null, isDeleting: false });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [boardRes, tasksRes] = await Promise.all([
        boardService.getBoard(boardId),
        taskService.getTasks(boardId),
      ]);
      setBoard(boardRes.data.board);
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      toast.error(extractErrorMessage(err));
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [boardId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Filtered / sorted per-column tasks ──────────────────────────────────
  const columnTasks = useMemo(() => {
    let filtered = [...tasks];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
      );
    }

    if (filters.priority) {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }

    filtered.sort((a, b) => {
      const dir = filters.sortOrder === 'desc' ? -1 : 1;
      switch (filters.sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1 * dir;
          if (!b.dueDate) return -1 * dir;
          return dir * (new Date(a.dueDate) - new Date(b.dueDate));
        case 'priority':
          return dir * ((PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1));
        case 'title':
          return dir * a.title.localeCompare(b.title);
        case 'createdAt':
          return dir * (new Date(a.createdAt) - new Date(b.createdAt));
        default:
          return dir * ((a.order ?? 0) - (b.order ?? 0));
      }
    });

    return STATUSES.reduce((acc, status) => {
      acc[status] = filtered.filter((t) => t.status === status);
      return acc;
    }, {});
  }, [tasks, filters]);

  // ── Task form handlers ───────────────────────────────────────────────────
  const openCreateTask = useCallback(
    (defaultStatus = 'todo') => setTaskForm({ open: true, task: null, defaultStatus }),
    []
  );

  const openEditTask = useCallback(
    (task) => setTaskForm({ open: true, task, defaultStatus: task.status }),
    []
  );

  const openDeleteTask = useCallback(
    (task) => setDeleteDialog({ open: true, task, isDeleting: false }),
    []
  );

  const handleTaskSubmit = async (data) => {
    if (taskForm.task) {
      const res = await taskService.updateTask(boardId, taskForm.task._id, data);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskForm.task._id ? res.data.task : t))
      );
      toast.success('Task updated!');
    } else {
      const res = await taskService.createTask(boardId, data);
      setTasks((prev) => [...prev, res.data.task]);
      toast.success('Task created!');
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialog((d) => ({ ...d, isDeleting: true }));
    try {
      await taskService.deleteTask(boardId, deleteDialog.task._id);
      setTasks((prev) => prev.filter((t) => t._id !== deleteDialog.task._id));
      toast.success('Task deleted.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeleteDialog({ open: false, task: null, isDeleting: false });
    }
  };

  // ── HTML5 Drag-and-Drop ──────────────────────────────────────────────────
  const handleDragStart = useCallback((task) => {
    setDraggingTaskId(task._id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingTaskId(null);
  }, []);

  const handleDropTask = useCallback(
    async (taskId, sourceStatus, targetStatus) => {
      setDraggingTaskId(null);
      if (sourceStatus === targetStatus) return;

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: targetStatus } : t))
      );

      try {
        await taskService.updateStatus(boardId, taskId, targetStatus);
      } catch (err) {
        // Rollback
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? { ...t, status: sourceStatus } : t))
        );
        toast.error(extractErrorMessage(err));
      }
    },
    [boardId]
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        {/* Breadcrumb + Add button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
          <nav className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 min-w-0">
            <Link
              to="/dashboard"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors
                         whitespace-nowrap"
            >
              Dashboard
            </Link>
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-900 dark:text-white font-medium truncate">
              {isLoading ? '…' : board?.title}
            </span>
          </nav>

          <div className="sm:ml-auto flex-shrink-0">
            <button
              onClick={() => openCreateTask('todo')}
              className="btn-primary btn-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4v16m8-8H4" />
              </svg>
              Add task
            </button>
          </div>
        </div>

        {board?.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 max-w-2xl">
            {board.description}
          </p>
        )}

        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-8 pt-2">
        {isLoading ? (
          <BoardViewSkeleton />
        ) : (
          <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
            {STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={columnTasks[status] || []}
                onAddTask={openCreateTask}
                onEditTask={openEditTask}
                onDeleteTask={openDeleteTask}
                onDropTask={handleDropTask}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                draggingTaskId={draggingTaskId}
                isLoading={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task form modal */}
      <TaskForm
        isOpen={taskForm.open}
        onClose={() => setTaskForm({ open: false, task: null, defaultStatus: 'todo' })}
        onSubmit={handleTaskSubmit}
        task={taskForm.task}
        boardId={boardId}
        defaultStatus={taskForm.defaultStatus}
      />

      {/* Delete confirm dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, task: null, isDeleting: false })}
        onConfirm={handleDeleteConfirm}
        title="Delete task?"
        message={
          deleteDialog.task
            ? `"${deleteDialog.task.title}" will be permanently deleted.`
            : ''
        }
        isLoading={deleteDialog.isDeleting}
      />
    </div>
  );
};

export default BoardView;
