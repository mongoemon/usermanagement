import React, { useState } from 'react';
import { functions } from '../firebase';
import { httpsCallable } from "firebase/functions";

const CreateFeatureFlagForm = ({ onFlagCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const createFeatureFlag = httpsCallable(functions, 'createFeatureFlag');
            await createFeatureFlag({ name, description });
            onFlagCreated();
            setName('');
            setDescription('');
        } catch (error) {
            console.error("Error creating flag:", error);
            setError(error.message);
        }

        setLoading(false);
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">Create New Feature Flag</h5>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3">
                        <label htmlFor="flag-name">Flag Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="flag-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="flag-description">Description</label>
                        <input
                            type="text"
                            className="form-control"
                            id="flag-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Flag'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateFeatureFlagForm; 