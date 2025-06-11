import React from 'react';
import ArticleList from '../ArticleList';

const ViewerDashboard = () => {
  return (
    <div>
      <h4 className="card-title">Published Articles</h4>
      <p className="card-text">
        Here are the latest published articles.
      </p>
      <hr />
      <ArticleList />
    </div>
  );
};

export default ViewerDashboard; 