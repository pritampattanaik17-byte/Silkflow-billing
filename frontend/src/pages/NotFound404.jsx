import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/Button';

const NotFound404 = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-heading font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-heading mb-4">Page not found</h2>
        <p className="text-text mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <Link to="/">
          <Button variant="primary" size="lg" leftIcon={Home} className="w-full sm:w-auto">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound404;
