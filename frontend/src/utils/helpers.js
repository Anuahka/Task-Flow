import { format, isPast, isToday, isTomorrow, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return null;
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (isNaN(d.getTime())) return null;
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'MMM d, yyyy');
  } catch {
    return null;
  }
};

export const isOverdue = (date) => {
  if (!date) return false;
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (isNaN(d.getTime())) return false;
    return isPast(d) && !isToday(d);
  } catch {
    return false;
  }
};

export const PRIORITY_LABELS = {
  high: 'High',
  med: 'Medium',
  low: 'Low',
};

// Lower number = higher priority (used for sorting)
export const PRIORITY_ORDER = { high: 0, med: 1, low: 2 };

export const STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

export const BOARD_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
];

export const extractErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
};
