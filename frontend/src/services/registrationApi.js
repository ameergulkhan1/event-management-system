import httpClient from './httpClient';

// ── REGISTER ──
export const apiRegister = async (eventId) => {
    try {
        const response = await httpClient.post('/registrations', { eventId });
        return response.data;
    } catch (error) {
        console.error('Register error:', error);
        throw new Error(error.response?.data?.message || 'Failed to register for event');
    }
};

// ── CANCEL REGISTRATION ──
export const apiCancelRegistration = async (eventId) => {
    try {
        const response = await httpClient.delete(`/registrations/${eventId}`);
        return response.data;
    } catch (error) {
        console.error('Cancel registration error:', error);
        throw new Error(error.response?.data?.message || 'Failed to cancel registration');
    }
};

// ── MY REGISTRATIONS ──
export const apiMyRegistrations = async () => {
    try {
        const response = await httpClient.get('/registrations/my');
        return {
            registrations: response.data.data || response.data || []
        };
    } catch (error) {
        console.error('Get my registrations error:', error);
        return { registrations: [] };
    }
};

// ── EVENT REGISTRATIONS (for organizers) ──
export const apiEventRegistrations = async (eventId) => {
    try {
        const response = await httpClient.get(`/registrations/event/${eventId}`);
        return {
            registrations: response.data.data || response.data || []
        };
    } catch (error) {
        // Don't log 403 errors as they're expected
        if (error.response?.status !== 403 && error.response?.status !== 500) {
            console.error('Get event registrations error:', error);
        }
        return { registrations: [] };
    }
};

// ── EXPORT ALL ──
const registrationApi = {
    register: apiRegister,
    cancelRegistration: apiCancelRegistration,
    myRegistrations: apiMyRegistrations,
    eventRegistrations: apiEventRegistrations,
    getEventRegistrations: apiEventRegistrations
};

export default registrationApi;