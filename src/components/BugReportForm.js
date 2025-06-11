import React, { useState } from 'react';
import { functions } from '../firebase';
import { httpsCallable } from "firebase/functions";

const BugReportForm = ({ onBugReported }) => {
    const [description, setDescription] = useState('');
    const [stepsToReproduce, setStepsToReproduce] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const createBugReport = httpsCallable(functions, 'createBugReport');
            await createBugReport({ description, stepsToReproduce });
            onBugReported();
            setDescription('');
            setStepsToReproduce('');
        } catch (error) {
            console.error("Error creating bug report:", error);
            setError(error.message);
        }

        setLoading(false);
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">Report a Bug</h5>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3">
                        <label htmlFor="bug-description">Description of Bug</label>
                        <textarea
                            className="form-control"
                            id="bug-description"
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="steps-to-reproduce">Steps to Reproduce</label>
                        <textarea
                            className="form-control"
                            id="steps-to-reproduce"
                            rows="5"
                            value={stepsToReproduce}
                            onChange={(e) => setStepsToReproduce(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BugReportForm; 