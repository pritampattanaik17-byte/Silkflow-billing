import React from 'react';
import { cn } from '../utils/cn';

const Input = React.forwardRef(({ className, type = 'text', error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        type={type}
        className={cn(
          "flex min-h-[44px] md:min-h-0 md:h-10 w-full rounded-input border border-border/80 hover:border-border dark:border-white/10 dark:hover:border-white/20 bg-white/70 dark:bg-black/20 backdrop-blur-sm px-3 py-2 text-base md:text-sm text-text dark:text-white placeholder:text-text/60 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white dark:focus:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
          error && "border-danger dark:border-danger/50 focus:ring-danger/50",
          className
        )}
        ref={ref}
        onWheel={(e) => {
          // Prevent scroll wheel from changing number input values
          if (type === 'number') {
            e.currentTarget.blur();
          }
        }}
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
