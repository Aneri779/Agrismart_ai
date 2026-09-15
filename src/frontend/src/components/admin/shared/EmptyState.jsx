import React from 'react';
import { Leaf } from 'lucide-react';

export const EmptyState = ({ title, description, icon: Icon = Leaf, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-[#008F5A]/30">
      <div className="w-16 h-16 bg-[#EAF8E9] rounded-full flex items-center justify-center mb-4 text-[#008F5A]">
        <Icon className="w-8 h-8 opacity-80" />
      </div>
      <h3 className="text-xl font-bold text-[#004D3C] mb-2">{title}</h3>
      <p className="text-[#45665A] mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
