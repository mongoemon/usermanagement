import React from 'react';
import ContentManagement from '../ContentManagement';

const EditorDashboard = () => {
  return (
    <div>
      <h4 className="card-title">Editor Dashboard</h4>
      <p className="card-text">
        Welcome to the editor dashboard. Here you can manage articles.
      </p>
      <hr />
      <ContentManagement />
    </div>
  );
};

export default EditorDashboard; 