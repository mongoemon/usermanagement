import React, { useState, useEffect } from 'react';
import BugReportForm from '../BugReportForm';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const TesterDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const reportsRef = collection(db, "bugReports");
      const q = query(reportsRef, orderBy("createdAt", "desc"), limit(5));
      const querySnapshot = await getDocs(q);
      const reportsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(reportsData);
    } catch (error) {
      console.error("Error fetching bug reports:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleBugReported = () => {
    // Re-fetch reports to show the new one
    fetchReports();
  };

  return (
    <div>
      <h4 className="card-title">Tester Dashboard</h4>
      <p className="card-text">
        Welcome to the tester dashboard. Here you can submit bug reports and see recent submissions.
      </p>
      <hr />
      
      <BugReportForm onBugReported={handleBugReported} />

      <h5 className="mt-4">Recent Bug Reports</h5>
      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <ul className="list-group">
          {reports.map(report => (
            <li key={report.id} className="list-group-item">
              <p className="mb-1">{report.description}</p>
              <small className="text-muted">Reported by: {report.reporterEmail} on {report.createdAt?.toDate().toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TesterDashboard; 