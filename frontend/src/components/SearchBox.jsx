import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../utils/cn';
import Input from './Input';

const SearchBox = React.forwardRef(({ className, placeholder = "Search...", ...props }, ref) => {
  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-10">
        <Search className="h-4 w-4 text-text/50 dark:text-white/50" />
      </div>
      <Input
        ref={ref}
        type="search"
        placeholder={placeholder}
        className="pl-10"
        {...props}
      />
    </div>
  );
});
SearchBox.displayName = 'SearchBox';

export default SearchBox;
