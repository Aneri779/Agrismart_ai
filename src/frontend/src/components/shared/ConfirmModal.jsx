import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#063F2F]/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl p-6 shadow-xl border border-[#D5E8D5] w-full max-w-md"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-[#E8F6E6] text-[#087A4B]'
              }`}>
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold font-sora text-[#063F2F] mb-2">{title}</h2>
              <p className="text-[#45665A] mb-8 text-sm">{message}</p>
              
              <div className="flex w-full gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-[#45665A] bg-[#FAFCF7] border border-[#D5E8D5] hover:bg-[#F3FAEF] transition-colors"
                >
                  {cancelText}
                </button>
                <button 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors ${
                    type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#087A4B] hover:bg-[#064D38]'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
