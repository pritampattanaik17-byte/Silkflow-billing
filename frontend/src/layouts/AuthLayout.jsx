import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-10 h-10 bg-accent rounded flex items-center justify-center font-bold text-primary text-xl">
            V
          </div>
          <span className="font-heading font-bold text-3xl tracking-wide text-primary">VastraFlow</span>
        </div>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
