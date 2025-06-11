import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot } from "firebase/firestore";

const FeatureFlagsContext = createContext({});

export const FeatureFlagsProvider = ({ children }) => {
    const [flags, setFlags] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = collection(db, "featureFlags");
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const flagsData = {};
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                flagsData[data.name] = data.enabled;
            });
            setFlags(flagsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = { flags, loading };

    return (
        <FeatureFlagsContext.Provider value={value}>
            {children}
        </FeatureFlagsContext.Provider>
    );
};

export const useFeatureFlags = () => useContext(FeatureFlagsContext); 