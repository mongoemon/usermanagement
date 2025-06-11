import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from "firebase/firestore";

const ArticleList = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const articlesRef = collection(db, "articles");
                const q = query(articlesRef, where("status", "==", "published"));
                const querySnapshot = await getDocs(q);
                const articlesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setArticles(articlesData);
            } catch (err) {
                console.error("Error fetching articles:", err);
                setError("Failed to load articles.");
            }
            setLoading(false);
        };

        fetchArticles();
    }, []);

    if (loading) {
        return <div>Loading articles...</div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (articles.length === 0) {
        return <div>No published articles found.</div>;
    }

    return (
        <div>
            {articles.map(article => (
                <div className="card mb-3" key={article.id}>
                    <div className="card-body">
                        <h5 className="card-title">{article.title}</h5>
                        <p className="card-text">{article.content.substring(0, 200)}...</p>
                        <a href={`/article/${article.id}`} className="btn btn-primary">Read More</a>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ArticleList; 