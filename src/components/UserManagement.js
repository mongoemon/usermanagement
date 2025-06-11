import React, { useState, useEffect } from 'react';
import { db, functions } from '../firebase';
import { collection, getDocs } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import CreateUserForm from './CreateUserForm';
import EditUserForm from './EditUserForm';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const usersCollection = await getDocs(collection(db, "users"));
            const usersData = usersCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUserCreated = () => {
        setShowCreateForm(false);
        fetchUsers(); // Re-fetch users after one is created
    };

    const handleUserUpdated = () => {
        setEditingUser(null);
        fetchUsers(); // Re-fetch users after one is updated
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                const deleteUser = httpsCallable(functions, 'deleteUser');
                await deleteUser({ uid: userId });
                fetchUsers(); // Re-fetch users after one is deleted
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Failed to delete user: " + error.message);
            }
        }
    };

    if (loading && users.length === 0) {
        return <div>Loading users...</div>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>User Management</h3>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? 'Cancel' : 'Add User'}
                </button>
            </div>

            {showCreateForm && <CreateUserForm onUserCreated={handleUserCreated} />}
            {editingUser && (
                <EditUserForm 
                    user={editingUser}
                    onUserUpdated={handleUserUpdated}
                    onCancel={() => setEditingUser(null)}
                />
            )}

            <table className="table table-striped mt-3">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button 
                                    className="btn btn-sm btn-primary me-2"
                                    onClick={() => setEditingUser(user)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteUser(user.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement; 