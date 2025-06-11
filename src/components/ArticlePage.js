import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from "firebase/firestore";

const ArticlePage = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, "articles", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().status === 'published') {
                    setArticle(docSnap.data());
                } else {
                    setError("Article not found or not published.");
                }
            } catch (err) {
                console.error("Error fetching article:", err);
                setError("Failed to load article.");
            }
            setLoading(false);
        };

        fetchArticle();
    }, [id]);

    if (loading) {
        return <div className="container mt-5">Loading article...</div>;
    }

    if (error) {
        return <div className="container mt-5 alert alert-danger">{error}</div>;
    }

    if (!article) {
        return null; // Should be handled by the error state
    }

    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-body">
                    <h1 className="card-title">{article.title}</h1>
                    <p className="card-text text-muted">
                        Published on: {article.createdAt?.toDate().toLocaleDateString()}
                    </p>
                    <hr />
                    <div className="article-content">
                        {article.content.split('\\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticlePage; 