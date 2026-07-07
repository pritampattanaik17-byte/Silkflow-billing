import React from 'react';
import { cn } from '../utils/cn';

export const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto rounded-card border border-border dark:border-white/10">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

export const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b dark:[&_tr]:border-white/10 bg-background/50 dark:bg-white/5", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0 bg-white dark:bg-transparent", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-border dark:border-white/10 transition-colors hover:bg-background/50 dark:hover:bg-white/5 data-[state=selected]:bg-background dark:data-[state=selected]:bg-white/10 text-text dark:text-white/80",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-text dark:text-white/60 [&:has([role=checkbox])]:pr-0 whitespace-nowrap",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0 dark:text-white/80", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";
