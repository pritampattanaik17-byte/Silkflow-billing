import React from 'react';
import { FileSearch } from 'lucide-react';
import Button from './Button';
import { cn } from '../utils/cn';

const EmptyState = ({ 
  title = "No data found", 
  description = "Get started by creating a new record.", 
  actionLabel, 
  onAction,
  icon: Icon = FileSearch,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center rounded-card border border-border dark:border-white/20 border-dashed bg-background/50 dark:bg-white/5", className)}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 dark:bg-white/10 mb-4">
        <Icon className="h-10 w-10 text-primary dark:text-white" />
      </div>
      <h3 className="text-lg font-semibold text-heading dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-text dark:text-white/70 mb-6 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
