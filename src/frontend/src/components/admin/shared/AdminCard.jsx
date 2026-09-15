import React from 'react';

export const AdminCard = ({ children, className = '', title, action }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-[#EAF8E9] flex flex-col ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-bold text-[#004D3C]">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
