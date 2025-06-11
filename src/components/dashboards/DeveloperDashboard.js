import React from 'react';
import FeatureFlagManager from '../FeatureFlagManager';

const DeveloperDashboard = () => {
  return (
    <div>
      <h4 className="card-title">Developer Dashboard</h4>
      <p className="card-text">
        Welcome to the developer dashboard. Here you can manage feature flags.
      </p>
      <hr />
      <FeatureFlagManager />
    </div>
  );
};

export default DeveloperDashboard; 