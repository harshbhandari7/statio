import { Fragment } from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md pt-8">
        <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Statio
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Status Page & Incident Management
        </p>
      </div>
      <Outlet />
    </div>
  );
} 