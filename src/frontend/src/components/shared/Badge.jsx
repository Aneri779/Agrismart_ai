import React from 'react';
import clsx from 'clsx';

export const Badge = ({ children, variant = 'info', className, ...props }) => {
  const variants = {
    success: 'bg-success/12 text-success',
    warning: 'bg-warning/12 text-warning',
    danger: 'bg-danger/12 text-danger',
    info: 'bg-info/12 text-info',
    brand: 'bg-brand-500/12 text-brand-600',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
