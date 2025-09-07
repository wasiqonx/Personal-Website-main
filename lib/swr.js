import fetch from 'isomorphic-unfetch';
import useSWR from 'swr';

// Default SWR wrapper without automatic refresh
export default function SWR(url, options = {}) {
    return useSWR(url, (href) => {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Add authorization header if token exists
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return fetch(href, {
            method: 'GET',
            headers
        }).then(res => res.json());
    }, options);
};

// SWR wrapper with refresh for dynamic data
export function SWRWithRefresh(url, interval = 5000) {
    return useSWR(url, (href) => {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Add authorization header if token exists
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return fetch(href, {
            method: 'GET',
            headers
        }).then(res => res.json());
    }, { refreshInterval: interval });
};
