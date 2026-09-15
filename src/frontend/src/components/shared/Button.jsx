import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600',
    outline: 'border border-brand-500 text-brand-500 hover:bg-brand-50',
    ghost: 'text-brand-500 hover:bg-brand-50',
    danger: 'bg-danger text-white hover:bg-red-700',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-14 px-8 text-lg rounded-lg',
  };

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';
