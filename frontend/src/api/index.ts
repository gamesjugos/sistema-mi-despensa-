import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 15000, // 15s timeout (ISO 25010 - Performance)
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request Interceptor – Attach JWT ────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor – Handle global errors ──────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string }>) => {
        if (error.response?.status === 401) {
            // Token expired or invalid → auto logout
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }

        if (error.code === 'ECONNABORTED') {
            return Promise.reject(new Error('La solicitud tardó demasiado. Verifica tu conexión a internet.'));
        }

        if (!error.response) {
            return Promise.reject(new Error('No se pudo conectar con el servidor. Verifica tu conexión.'));
        }

        // Pass through the server error message if present
        const serverMessage = error.response.data?.message;
        if (serverMessage) {
            return Promise.reject(new Error(serverMessage));
        }

        return Promise.reject(error);
    }
);

export default api;
