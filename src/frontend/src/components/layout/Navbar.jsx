import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../shared/Button';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
        scrolled ? 'bg-surface-0 shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="text-brand-500 w-8 h-8" />
            <span className="font-sora font-bold text-xl text-ink-900">AgriSmart AI</span>
          </Link>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-ink-600 hover:text-brand-500 font-medium">Features</a>
            <a href="#how-it-works" className="text-ink-600 hover:text-brand-500 font-medium">How It Works</a>
            <Link to="/about" className="text-ink-600 hover:text-brand-500 font-medium">About</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
