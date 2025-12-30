import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from token
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');

            if (storedToken) {
                try {
                    const response = await authService.getMe();
                    setUser(response.data.user);
                    setToken(storedToken);
                } catch (err) {
                    console.error('Token validation failed:', err);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }

            setLoading(false);
        };

        initializeAuth();
    }, []);

    // Register user
    const register = useCallback(async (userData) => {
        setError(null);
        setLoading(true);

        try {
            const response = await authService.register(userData);
            const { user: newUser, token: newToken } = response.data;

            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(newUser);

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Login user
    const login = useCallback(async (credentials) => {
        setError(null);
        setLoading(true);

        try {
            const response = await authService.login(credentials);
            const { user: loggedInUser, token: newToken } = response.data;

            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(loggedInUser);

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Logout user
    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    }, []);

    // Update user profile
    const updateProfile = useCallback(async (profileData) => {
        setError(null);

        try {
            const response = await authService.updateProfile(profileData);
            setUser(response.data.user);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Profile update failed';
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    // Update avatar
    const updateAvatar = useCallback(async (file) => {
        setError(null);

        try {
            const response = await authService.uploadAvatar(file);
            setUser(response.data.user);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Avatar upload failed';
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Context value
    const value = {
        user,
        token,
        loading,
        error,
        isAuthenticated: !!user && !!token,
        register,
        login,
        logout,
        updateProfile,
        updateAvatar,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

export default AuthContext;
