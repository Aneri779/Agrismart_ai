import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { cardHover } from '../../lib/motion';

export const Card = ({ children, className, hoverable = false, ...props }) => {
  const baseStyles = 'bg-surface-0 rounded-lg shadow-sm border border-border p-6';
  
  if (hoverable) {
    return (
      <motion.div
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        className={clsx(baseStyles, className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={clsx(baseStyles, className)} {...props}>
      {children}
    </div>
  );
};
