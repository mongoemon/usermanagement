import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ArticlePage from './components/ArticlePage';
import { ROLES } from './roles';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Home = () => (
  <div className="container mt-5">
    <div className="row">
      <div className="col-md-6 offset-md-3 text-center">
        <h1 className="mb-4">User Management System</h1>
        <p className="lead mb-4">
          Please log in to continue.
        </p>
        <Link to="/login" className="btn btn-primary btn-lg">
          Login
        </Link>
      </div>
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const userDocRef = doc(db, "users", authUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            role: userDoc.data().role,
          });
        } else {
          // TODO: Handle case where user exists in Auth but not Firestore
          console.log("User not found in Firestore");
          // For now, default to guest
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            role: ROLES.GUEST,
          });
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  const AppLayout = ({ children, user }) => (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/dashboard">U.M.S.</Link>
          <div className="d-flex">
            <span className="navbar-text me-3">
              Welcome, {user.email} ({user.role})
            </span>
            <button className="btn btn-outline-light" onClick={() => signOut(auth)}>Logout</button>
          </div>
        </div>
      </nav>
      <main>
        {children}
      </main>
    </>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <Home /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route 
          path="/dashboard" 
          element={user ? <AppLayout user={user}><Dashboard user={user} /></AppLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/article/:id"
          element={user ? <AppLayout user={user}><ArticlePage /></AppLayout> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
