import React, { useState } from 'react';
import { ROLES } from '../roles';
import { functions } from '../firebase';
import { httpsCallable } from "firebase/functions";

const CreateUserForm = ({ onUserCreated }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(ROLES.VIEWER);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            const createUser = httpsCallable(functions, 'createUser');
            await createUser({ email, password, role });
            
            // The onUserCreated callback will now be called from the parent 
            // component, which will refetch the user list.
            onUserCreated();
            
            setEmail('');
            setPassword('');
            setRole(ROLES.VIEWER);
        } catch (error) {
            console.error("Error creating user:", error);
            setError(error.message);
        }

        setLoading(false);
    };

    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title">Create New User</h5>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
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
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create User'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateUserForm; 