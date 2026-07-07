import React from 'react';
import { cn } from '../utils/cn';

const Select = React.forwardRef(({ className, options, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <select
        className={cn(
          "flex h-10 w-full rounded-input border border-white/50 bg-white/40 backdrop-blur-sm px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/60 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
          error && "border-danger focus:ring-danger/50",
          className
        )}
        ref={ref}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-danger">{error}</p>
      )}
    </div>
  );
});
Select.displayName = 'Select';

export default Select;
