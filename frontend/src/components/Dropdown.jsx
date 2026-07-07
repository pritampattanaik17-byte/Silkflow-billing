import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';

const Dropdown = ({ trigger, children, align = 'right', className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={cn(
            "absolute z-50 mt-2 w-56 rounded-2xl bg-white dark:bg-[#152842] border border-border dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden",
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            className
          )}
          onClick={(e) => {
            // Only close if it's not a submenu click or something that explicitly prevents it
            setIsOpen(false);
          }}
        >
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, onClick, className, icon: Icon, danger }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center px-4 py-2 text-sm text-text dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 hover:text-heading dark:hover:text-white transition-colors",
        danger && "text-danger hover:text-danger hover:bg-danger/10 dark:hover:bg-danger/20",
        className
      )}
    >
      {Icon && <Icon className="mr-3 h-4 w-4" aria-hidden="true" />}
      {children}
    </button>
  );
};

export default Dropdown;
