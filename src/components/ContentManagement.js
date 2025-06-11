import React, { useState, useEffect } from 'react';
import { db, functions } from '../firebase';
import { collection, getDocs } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import CreateArticleForm from './CreateArticleForm';
import EditArticleForm from './EditArticleForm';

const ContentManagement = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const articlesCollection = await getDocs(collection(db, "articles"));
            const articlesData = articlesCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setArticles(articlesData);
        } catch (error) {
            console.error("Error fetching articles:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleArticleCreated = () => {
        setShowCreateForm(false);
        fetchArticles();
    };

    const handleArticleUpdated = () => {
        setEditingArticle(null);
        fetchArticles();
    };

    const handleDeleteArticle = async (articleId) => {
        if (window.confirm("Are you sure you want to delete this article?")) {
            try {
                const deleteArticle = httpsCallable(functions, 'deleteArticle');
                await deleteArticle({ id: articleId });
                fetchArticles();
            } catch (error) {
                console.error("Error deleting article:", error);
                alert("Failed to delete article: " + error.message);
            }
        }
    };

    if (loading && articles.length === 0) {
        return <div>Loading articles...</div>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Content Management</h3>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? 'Cancel' : 'New Article'}
                </button>
            </div>
            
            {showCreateForm && <CreateArticleForm onArticleCreated={handleArticleCreated} />}
            {editingArticle && (
                <EditArticleForm 
                    article={editingArticle}
                    onArticleUpdated={handleArticleUpdated}
                    onCancel={() => setEditingArticle(null)}
                />
            )}

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {articles.map(article => (
                        <tr key={article.id}>
                            <td>{article.title}</td>
                            <td>{article.status || 'draft'}</td>
                            <td>
                                <button 
                                    className="btn btn-sm btn-primary me-2"
                                    onClick={() => setEditingArticle(article)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteArticle(article.id)}
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

export default ContentManagement; 