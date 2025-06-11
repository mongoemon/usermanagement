import React, { useState } from 'react';
import { functions } from '../firebase';
import { httpsCallable } from "firebase/functions";

const CreateArticleForm = ({ onArticleCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const createArticle = httpsCallable(functions, 'createArticle');
            await createArticle({ title, content });
            onArticleCreated();
            setTitle('');
            setContent('');
        } catch (error) {
            console.error("Error creating article:", error);
            setError(error.message);
        }

        setLoading(false);
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">Create New Article</h5>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            className="form-control"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="content">Content</label>
                        <textarea
                            className="form-control"
                            id="content"
                            rows="5"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Article'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateArticleForm; 