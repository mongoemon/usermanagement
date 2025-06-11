import React, { useState } from 'react';
import { functions } from '../firebase';
import { httpsCallable } from "firebase/functions";

const EditArticleForm = ({ article, onArticleUpdated, onCancel }) => {
    const [title, setTitle] = useState(article.title);
    const [content, setContent] = useState(article.content);
    const [status, setStatus] = useState(article.status || 'draft');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const updateArticle = httpsCallable(functions, 'updateArticle');
            await updateArticle({ id: article.id, title, content, status });
            onArticleUpdated();
        } catch (error) {
            console.error("Error updating article:", error);
            setError(error.message);
        }

        setLoading(false);
    };

    return (
        <div className="card my-4">
            <div className="card-body">
                <h5 className="card-title">Edit Article</h5>
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
                    <div className="mb-3">
                        <label htmlFor="status">Status</label>
                        <select
                            className="form-control"
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Article'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditArticleForm; 