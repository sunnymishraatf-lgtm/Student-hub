import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center">
        <ExclamationTriangleIcon className="w-20 h-20 text-warning-500 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Oops! Page not found
        </p>
        <Link
          to="/dashboard"
          className="btn-primary inline-block"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
