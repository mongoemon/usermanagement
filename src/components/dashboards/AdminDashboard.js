import React from 'react';
import UserManagement from '../UserManagement';

const AdminDashboard = () => {
  return (
    <div>
      <h4 className="card-title">Admin Dashboard</h4>
      <p className="card-text">
        Welcome to the admin dashboard. Here you can manage users and other settings.
      </p>
      <hr />
      <UserManagement />
    </div>
  );
};

export default AdminDashboard; 