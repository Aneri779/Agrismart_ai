import React from 'react';
import { Leaf, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-brand-900 text-surface-2 py-12 border-t border-brand-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <Leaf className="text-brand-400 w-8 h-8" />
          <span className="font-sora font-bold text-xl text-surface-0">AgriSmart AI</span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 items-center text-sm text-brand-200">
          <Link to="/about" className="hover:text-surface-0 transition-colors">About & Reproducibility</Link>
          <a href="#" className="hover:text-surface-0 transition-colors">Dataset Citation</a>
          <a href="#" className="flex items-center gap-2 hover:text-surface-0 transition-colors">
            <Globe className="w-4 h-4" /> Open Source
          </a>
        </div>
      </div>
    </footer>
  );
};
