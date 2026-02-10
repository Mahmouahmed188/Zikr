import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiError } from '../types';

// Base API Configuration
const QURAN_API_URL = 'https://www.mp3quran.net/api/v3';

// Create axios instance for Quran API
export const quranClient: AxiosInstance = axios.create({
    baseURL: QURAN_API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Error handler helper
export const handleApiError = (error: AxiosError<ApiError>): ApiError => {
    if (error.response?.data) {
        return error.response.data;
    }
    
    if (error.request) {
        return {
            message: 'Network error. Please check your connection.',
            code: 'NETWORK_ERROR',
            status: 0,
        };
    }
    
    return {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        status: 500,
    };
};

export default quranClient;
