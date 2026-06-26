import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const BoardCardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <div className="flex items-start justify-between">
      <Skeleton className="h-5 w-3/4 rounded" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <Skeleton className="h-4 w-full rounded" />
    <Skeleton className="h-4 w-2/3 rounded" />
    <div className="flex items-center gap-2 pt-1">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
  </div>
);

export const TaskCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-card space-y-2 border border-slate-100 dark:border-slate-700">
    <Skeleton className="h-4 w-5/6 rounded" />
    <Skeleton className="h-3 w-full rounded" />
    <div className="flex items-center gap-2 pt-1">
      <Skeleton className="h-5 w-12 rounded-full" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  </div>
);

export const BoardViewSkeleton = () => (
  <div className="flex gap-4 overflow-x-auto pb-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex-shrink-0 w-72 space-y-3">
        <Skeleton className="h-8 w-32 rounded-lg" />
        {[1, 2, 3].map((j) => (
          <TaskCardSkeleton key={j} />
        ))}
      </div>
    ))}
  </div>
);
