import React from 'react';

export const BotanicalBg = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Bottom Right Leaf cluster */}
      <svg
        className="absolute -bottom-10 -right-10 opacity-30 text-[#35A866] w-96 h-96 transform rotate-[-15deg]"
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M50 100C50 100 100 80 100 50C100 20 80 0 50 0C50 0 50 45 50 50C50 55 50 100 50 100Z" />
        <path d="M50 100C50 100 0 80 0 50C0 20 20 0 50 0" opacity="0.6" />
      </svg>
      
      {/* Top Left Leaf */}
      <svg
        className="absolute top-10 -left-10 opacity-20 text-[#79C98A] w-64 h-64 transform rotate-[45deg]"
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M50 100C50 100 100 80 100 50C100 20 80 0 50 0C50 0 50 45 50 50C50 55 50 100 50 100Z" />
      </svg>
    </div>
  );
};
