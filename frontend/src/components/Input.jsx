import React from 'react';
import { cn } from '../utils/cn';

const Input = React.forwardRef(({ className, type = 'text', error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        type={type}
        className={cn(
          "flex h-11 md:h-10 w-full rounded-input border border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-sm px-3 py-2 text-sm text-text dark:text-white placeholder:text-text/60 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/60 dark:focus:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
          error && "border-danger dark:border-danger/50 focus:ring-danger/50",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-danger">{error}</p>
      )}
    </div>
  );
});
Input.displayName = 'Input';

export default Input;
