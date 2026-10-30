import React from 'react';

export const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200 dark:bg-slate-700/60 rounded-lg ${className}`}
        />
      ))}
    </>
  );
};

export const CardSkeleton = () => (
  <div className="p-5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-3">
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-3 w-36" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="border border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark p-4 space-y-3">
    <div className="flex justify-between pb-3 border-b border-border-light dark:border-border-dark">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-24" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 py-2 items-center">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    ))}
  </div>
);

