import React, { useState } from 'react';
import { ROLES } from '../roles';
import { functions } from '../firebase';
import { httpsCallable } from "firebase/functions";

const EditUserForm = ({ user, onUserUpdated, onCancel }) => {
    const [role, setRole] = useState(user.role);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const updateUserRole = httpsCallable(functions, 'updateUserRole');
            await updateUserRole({ uid: user.id, role });
            onUserUpdated();
        } catch (error) {
            console.error("Error updating user role:", error);
            setError(error.message);
        }

        setLoading(false);
    };

    return (
        <div className="card mt-3">
            <div className="card-body">
                <h5 className="card-title">Edit User: {user.email}</h5>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3">
                        <label htmlFor="role">Role</label>
                        <select
                            className="form-control"
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            {Object.values(ROLES).map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Role'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditUserForm; 