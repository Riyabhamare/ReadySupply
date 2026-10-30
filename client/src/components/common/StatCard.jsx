import React from 'react';
import { Tooltip } from './Tooltip.jsx';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  onClick,
  badge,
  tooltip,
}) => {
  const variantStyles = {
    default: 'border-border-light dark:border-border-dark',
    warning: 'border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20',
    danger: 'border-red-300 dark:border-red-800 bg-red-50/40 dark:bg-red-950/20',
    success: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20',
    info: 'border-blue-300 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20',
  };

  const iconColors = {
    default: 'text-primary bg-primary-50 dark:bg-primary-950/50',
    warning: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40',
    danger: 'text-red-600 bg-red-100 dark:bg-red-900/40',
    success: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40',
    info: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40',
  };

  const cardContent = (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative p-4 sm:p-5 rounded-xl border bg-surface-light dark:bg-surface-dark shadow-subtle transition-all duration-150 h-full flex flex-col justify-between ${variantStyles[variant]} ${
        onClick
          ? 'cursor-pointer hover:shadow-elevated hover:border-primary-400 dark:hover:border-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-light dark:text-muted-dark leading-snug break-words hyphens-auto">
            {title}
          </p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-text-light dark:text-text-dark mt-1 font-mono">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg shrink-0 ml-1.5 ${iconColors[variant]}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>

      {(subtitle || badge) && (
        <div className="mt-3 pt-2 border-t border-border-light/60 dark:border-border-dark/60 flex items-center justify-between text-[11px] text-muted-light dark:text-muted-dark gap-1">
          {subtitle && <span className="truncate" title={typeof subtitle === 'string' ? subtitle : undefined}>{subtitle}</span>}
          {badge && <span className="ml-auto shrink-0">{badge}</span>}
        </div>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} position="top">
        <div className="w-full h-full">{cardContent}</div>
      </Tooltip>
    );
  }

  return cardContent;
};
