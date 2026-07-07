import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import Button from './Button';
import { cn } from '../utils/cn';

const Pagination = ({ currentPage, totalPages, onPageChange, className }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Simple pagination logic for demonstration
  let visiblePages = pages;
  if (totalPages > 5) {
    if (currentPage <= 3) {
      visiblePages = [...pages.slice(0, 4), '...', totalPages];
    } else if (currentPage >= totalPages - 2) {
      visiblePages = [1, '...', ...pages.slice(totalPages - 4)];
    } else {
      visiblePages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-text/50">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'primary' : 'ghost'}
              size="sm"
              className="w-8"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          )
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Pagination;
