import httpClient from './httpClient';

// ── LOGIN ──
export const apiLogin = async (credentials) => {
    try {
        const response = await httpClient.post('/auth/login', credentials);
        
        if (response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        
        return {
            user: response.data.data?.user,
            token: response.data.data?.token,
            message: response.data.message
        };
    } catch (error) {
        console.error('Login error:', error);
        throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
};

// ── SIGNUP ──
export const apiSignup = async (userData) => {
    try {
        const response = await httpClient.post('/auth/signup', userData);
        return response.data;
    } catch (error) {
        console.error('Signup error:', error);
        throw new Error(error.response?.data?.message || 'Signup failed. Please try again.');
    }
};

// ── GET CURRENT USER ──
export const apiGetMe = async () => {
    try {
        const response = await httpClient.get('/auth/me');
        return response.data;
    } catch (error) {
        console.error('Get me error:', error);
        throw new Error(error.response?.data?.message || 'Failed to get user information');
    }
};

// ── UPDATE PROFILE ──
export const apiUpdateProfile = async (userData) => {
    try {
        const response = await httpClient.put('/auth/update', userData);
        return response.data;
    } catch (error) {
        console.error('Update profile error:', error);
        throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
};

// ── LOGOUT ──
export const apiLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

// ── EXPORT ALL as object ──
const authApi = {
    login: apiLogin,
    signup: apiSignup,
    getMe: apiGetMe,
    updateProfile: apiUpdateProfile,
    logout: apiLogout
};

export default authApi;