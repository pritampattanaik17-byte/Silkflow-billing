import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../utils/cn';

const NotificationToast = ({ 
  title, 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const types = {
    success: {
      icon: CheckCircle2,
      color: 'text-success',
      bg: 'bg-white',
      border: 'border-border'
    },
    error: {
      icon: XCircle,
      color: 'text-danger',
      bg: 'bg-white',
      border: 'border-border'
    },
    warning: {
      icon: AlertCircle,
      color: 'text-warning',
      bg: 'bg-white',
      border: 'border-border'
    },
    info: {
      icon: Info,
      color: 'text-secondary',
      bg: 'bg-white',
      border: 'border-border'
    }
  };

  const { icon: Icon, color, bg, border } = types[type];

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-card border shadow-subtle transition-all duration-300",
        bg, border,
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn("h-5 w-5", color)} aria-hidden="true" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-heading">{title}</p>
            {message && (
              <p className="mt-1 text-sm text-text">{message}</p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-white text-text/50 hover:text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
