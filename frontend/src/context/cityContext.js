"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CityContext = createContext();
const PRIMARY_API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api').replace(/\/+$/, '');
const BACKUP_API = 'https://www.muftmadad.com/api';

const DEFAULT_CITIES = [
    { id: 1, name_en: 'Moradabad', name_hi: 'मुरादाबाद', slug: 'moradabad', is_active: true, display_order: 1 },
    { id: 2, name_en: 'Delhi', name_hi: 'दिल्ली', slug: 'delhi', is_active: true, display_order: 2 },
    { id: 3, name_en: 'Noida', name_hi: 'नोएडा', slug: 'noida', is_active: true, display_order: 3 },
];

export function CityProvider({ children }) {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCities = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${PRIMARY_API}/cities`, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
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
            
            if (activeCities.length > 0) {
                setCities(activeCities);
                return;
            }
            setCities(DEFAULT_CITIES);
        } catch (primaryError) {
            console.warn('Primary cities fetch failed:', primaryError.message);
            setError(primaryError.message);
            
            // Fallback: only try backup URL if primary is different from backup
            if (PRIMARY_API !== BACKUP_API) {
                try {
                    const fallbackRes = await axios.get(`${BACKUP_API}/cities`, { timeout: 4000 });
                    const fallbackCities = fallbackRes.data?.data || fallbackRes.data || [];
                    const activeFallback = fallbackCities
                        .filter(c => c.is_active === true || c.is_active === 'true')
                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
                    if (activeFallback.length > 0) {
                        setCities(activeFallback);
                        return;
                    }
                } catch (fallbackError) {
                    console.warn('Fallback also failed:', fallbackError.message);
                }
            }
            setCities(DEFAULT_CITIES);
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