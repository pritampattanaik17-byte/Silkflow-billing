import React from 'react';
import { cn } from '../utils/cn';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-button font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50 dark:bg-primary/80 dark:hover:bg-primary',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/50 dark:bg-secondary/80 dark:hover:bg-secondary',
    outline: 'border border-border dark:border-white/20 bg-white dark:bg-transparent text-text dark:text-white hover:bg-background dark:hover:bg-white/10 focus:ring-primary/50',
    ghost: 'hover:bg-background dark:hover:bg-white/10 text-text dark:text-white focus:ring-primary/50',
    danger: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger/50 dark:bg-danger/80 dark:hover:bg-danger',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 w-10',
  };

  return (
    <button
      ref={ref}
      disabled={isLoading || disabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && LeftIcon && <LeftIcon className="mr-2 h-4 w-4" />}
      {children}
      {!isLoading && RightIcon && <RightIcon className="ml-2 h-4 w-4" />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
