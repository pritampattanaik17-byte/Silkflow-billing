import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import Button from '../components/Button';

const ErrorPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-card border border-border shadow-subtle max-w-md w-full text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 mb-6">
          <AlertTriangle className="h-8 w-8 text-danger" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-heading mb-2">Something went wrong</h2>
        <p className="text-text mb-8">
          An unexpected error has occurred. Our team has been notified. Please try again later.
        </p>
        <Button 
          variant="primary" 
          className="w-full"
          leftIcon={RefreshCcw}
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
