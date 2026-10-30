import React from 'react';
import { Button } from './Button.jsx';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-light dark:bg-surface-dark border border-dashed border-border-light dark:border-border-dark rounded-2xl my-4">
      <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center text-primary mb-4 shadow-subtle">
        {Icon ? (
          <Icon className="w-7 h-7" />
        ) : (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>

      <h3 className="text-base font-semibold text-text-light dark:text-text-dark">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark mt-1 max-w-sm">
        {description}
      </p>

      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="md" icon={actionIcon} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

