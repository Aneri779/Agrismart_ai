import React from 'react';
import { Leaf } from 'lucide-react';

export const EmptyState = ({ title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-lg bg-surface-1">
      <div className="bg-brand-50 p-4 rounded-full mb-4">
        <Leaf className="w-8 h-8 text-brand-500" />
      </div>
      <h3 className="text-lg font-semibold text-ink-900 mb-2">{title}</h3>
      <p className="text-ink-600 mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
