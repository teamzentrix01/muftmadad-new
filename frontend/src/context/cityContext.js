"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CityContext = createContext();
const API = process.env.NEXT_PUBLIC_API_URL || 'https://www.muftmadad.com/api';

export function CityProvider({ children }) {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCities = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching cities from:', `${API}/cities`);
            const res = await axios.get(`${API}/cities`, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            console.log('API Response:', res.data);
            
            let activeCities = [];
            if (res.data?.data) {
                activeCities = res.data.data;
            } else if (Array.isArray(res.data)) {
                activeCities = res.data;
            }
            
            // Filter active cities and sort by display order
            activeCities = activeCities
                .filter(city => city.is_active === true || city.is_active === 'true')
                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
            
            console.log('Processed cities:', activeCities);
            setCities(activeCities);
        } catch (error) {
            console.error('Failed to fetch cities:', error);
            setError(error.message);
            
            // Fallback: Try to fetch from backup URL if main fails
            try {
                console.log('Trying fallback URL...');
                const fallbackRes = await axios.get('http://localhost:4000/api/cities', {
                    timeout: 5000
                });
                const fallbackCities = fallbackRes.data?.data || fallbackRes.data || [];
                setCities(fallbackCities.filter(c => c.is_active));
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                setCities([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCities();
        
        // Refresh cities every 5 minutes
        const interval = setInterval(fetchCities, 300000);
        return () => clearInterval(interval);
    }, []);

    return (
        <CityContext.Provider value={{ 
            cities, 
            loading, 
            error,
            refreshCities: fetchCities 
        }}>
            {children}
        </CityContext.Provider>
    );
}

export const useCities = () => {
    const context = useContext(CityContext);
    if (context === undefined) {
        throw new Error('useCities must be used within a CityProvider');
    }
    return context;
};