import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { boardService } from '../services/boardService';
import Navbar from '../components/layout/Navbar';
import BoardCard from '../components/board/BoardCard';
import BoardForm from '../components/board/BoardForm';
import { BoardCardSkeleton } from '../components/ui/Skeleton';
import { extractErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);

  const fetchBoards = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await boardService.getBoards();
      setBoards(res.data.boards);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchBoards(); }, [fetchBoards]);

  const handleCreate = async (data) => {
    const res = await boardService.createBoard(data);
    setBoards((prev) => [res.data.board, ...prev]);
    toast.success('Board created!');
  };

  const handleEdit = (board) => {
    setEditingBoard(board);
    setShowForm(true);
  };

  const handleUpdate = async (data) => {
    const res = await boardService.updateBoard(editingBoard._id, data);
    setBoards((prev) =>
      prev.map((b) => (b._id === editingBoard._id ? res.data.board : b))
    );
    setEditingBoard(null);
    toast.success('Board updated!');
  };

  const handleDelete = async (id) => {
    await boardService.deleteBoard(id);
    setBoards((prev) => prev.filter((b) => b._id !== id));
    toast.success('Board deleted.');
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBoard(null);
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {greeting}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {isLoading
                ? 'Loading your boards…'
                : boards.length === 0
                ? 'Create your first board to get started'
                : `You have ${boards.length} board${boards.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New board
          </button>
        </div>

        {/* Board grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <BoardCardSkeleton key={i} />
            ))}
          </div>
        ) : boards.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border-2 border-dashed border-primary-200 dark:border-primary-800 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              No boards yet
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
              Boards help you organize tasks by project, team, or workflow. Create one to get started.
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create your first board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map((board) => (
              <BoardCard
                key={board._id}
                board={board}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Board form modal */}
      <BoardForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSubmit={editingBoard ? handleUpdate : handleCreate}
        board={editingBoard}
      />
    </div>
  );
};

export default Dashboard;
