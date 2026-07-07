import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

const Modal = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-heading/40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={cn("relative z-50 w-full max-w-lg rounded-2xl bg-white border border-border shadow-2xl p-6 flex flex-col max-h-[90vh]", className)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-heading">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-background transition-colors text-text/70 hover:text-heading"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
