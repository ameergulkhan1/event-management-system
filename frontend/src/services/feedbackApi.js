import httpClient from './httpClient';

// ── SUBMIT FEEDBACK (Students) ──
export const apiSubmitFeedback = async (feedbackData) => {
    try {
        const response = await httpClient.post('/feedback', feedbackData);
        return response.data;
    } catch (error) {
        console.error('Submit feedback error:', error);
        throw new Error(error.response?.data?.message || 'Failed to submit feedback');
    }
};

// ── MY FEEDBACK (Students - get their own feedback) ──
export const apiMyFeedback = async () => {
    try {
        const response = await httpClient.get('/feedback/my');
        return {
            feedbacks: response.data.data || response.data || []
        };
    } catch (error) {
        console.error('Get my feedback error:', error);
        return { feedbacks: [] };
    }
};

// ── GET FEEDBACK (Organizers - get feedback for their events) ──
export const apiGetFeedback = async (eventId) => {
    try {
        let response;
        if (eventId) {
            response = await httpClient.get(`/feedback/event/${eventId}`);
        } else {
            // For organizers, get feedback for their events
            // Since we don't have a dedicated endpoint, return empty
            return { feedbacks: [] };
        }
        return {
            feedbacks: response.data.data || response.data || []
        };
    } catch (error) {
        console.error('Get feedback error:', error);
        return { feedbacks: [] };
    }
};

// ── GET EVENT FEEDBACK (Alias) ──
export const apiGetEventFeedback = apiGetFeedback;

// ── ADMIN: GET ALL FEEDBACK ──
export const apiAdminGetAllFeedback = async () => {
    try {
        const response = await httpClient.get('/feedback/admin/all');
        return {
            feedbacks: response.data.data || response.data || []
        };
    } catch (error) {
        console.error('Admin get all feedback error:', error);
        return { feedbacks: [] };
    }
};

// ── ADMIN: GET FEEDBACK STATS ──
export const apiAdminGetFeedbackStats = async () => {
    try {
        const response = await httpClient.get('/feedback/admin/stats');
        return response.data;
    } catch (error) {
        console.error('Get feedback stats error:', error);
        return { totalFeedback: 0, averageRating: 0, eventsWithFeedback: 0, usersWithFeedback: 0 };
    }
};

const feedbackApi = {
    submitFeedback: apiSubmitFeedback,
    myFeedback: apiMyFeedback,
    getFeedback: apiGetFeedback,
    getEventFeedback: apiGetEventFeedback,
    adminGetAllFeedback: apiAdminGetAllFeedback,
    adminGetStats: apiAdminGetFeedbackStats
};

export default feedbackApi;