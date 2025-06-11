import React, { useState, useEffect } from 'react';
import { db, functions } from '../firebase';
import { collection, getDocs } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import CreateFeatureFlagForm from './CreateFeatureFlagForm';

const FeatureFlagManager = () => {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const fetchFlags = async () => {
        setLoading(true);
        try {
            const flagsCollection = await getDocs(collection(db, "featureFlags"));
            const flagsData = flagsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFlags(flagsData);
        } catch (error) {
            console.error("Error fetching feature flags:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFlags();
    }, []);

    const handleFlagCreated = () => {
        setShowCreateForm(false);
        fetchFlags();
    };

    const handleToggleFlag = async (id, currentStatus) => {
        try {
            const toggleFeatureFlag = httpsCallable(functions, 'toggleFeatureFlag');
            await toggleFeatureFlag({ id, enabled: !currentStatus });
            fetchFlags();
        } catch (error) {
            console.error("Error toggling flag:", error);
            alert("Failed to toggle flag: " + error.message);
        }
    };

    if (loading) {
        return <div>Loading feature flags...</div>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Feature Flag Management</h3>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? 'Cancel' : 'New Flag'}
                </button>
            </div>

            {showCreateForm && <CreateFeatureFlagForm onFlagCreated={handleFlagCreated} />}

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Flag Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {flags.map(flag => (
                        <tr key={flag.id}>
                            <td>{flag.name}</td>
                            <td>{flag.description}</td>
                            <td>
                                <span className={`badge bg-${flag.enabled ? 'success' : 'secondary'}`}>
                                    {flag.enabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </td>
                            <td>
                                <button 
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleToggleFlag(flag.id, flag.enabled)}
                                >
                                    Toggle
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FeatureFlagManager; 