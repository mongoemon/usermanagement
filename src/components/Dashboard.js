import React from 'react';
import { ROLES } from '../roles';
import AdminDashboard from './dashboards/AdminDashboard';
import EditorDashboard from './dashboards/EditorDashboard';
import ViewerDashboard from './dashboards/ViewerDashboard';
import TesterDashboard from './dashboards/TesterDashboard';
import DeveloperDashboard from './dashboards/DeveloperDashboard';
import GuestDashboard from './dashboards/GuestDashboard';
import { useFeatureFlags } from '../FeatureFlagContext';

const Dashboard = ({ user }) => {
  const { flags, loading } = useFeatureFlags();

  const renderContent = () => {
    switch (user.role) {
      case ROLES.ADMIN:
        return <AdminDashboard />;
      case ROLES.EDITOR:
        return <EditorDashboard />;
      case ROLES.VIEWER:
        return <ViewerDashboard />;
      case ROLES.TESTER:
        return <TesterDashboard />;
      case ROLES.DEVELOPER:
        return <DeveloperDashboard />;
      default:
        return <GuestDashboard />;
    }
  };

  return (
    <div className="container mt-5">
      {!loading && flags.showBetaBanner && (
        <div className="alert alert-info">
          <strong>Beta Feature!</strong> You are seeing this because the 'showBetaBanner' feature flag is enabled.
        </div>
      )}
      <div className="card">
        <div className="card-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 