import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export const Loader = ({ text = "Loading...", fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="text-brand-500"
      >
        <Leaf size={48} />
      </motion.div>
      <p className="text-ink-600 font-medium">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-surface-1/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="p-8 flex justify-center">{content}</div>;
};
