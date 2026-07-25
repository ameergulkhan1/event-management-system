import httpClient from './httpClient';

// ── ADMIN: GET ALL USERS ──
export const apiGetUsers = async () => {
    try {
        const response = await httpClient.get('/users');
        return {
            users: response.data.data || response.data || []
        };
    } catch (error) {
        console.error('Get users error:', error);
        return { users: [] };
    }
};

// ── ADMIN: DELETE USER ──
export const apiDeleteUser = async (id) => {
    try {
        const response = await httpClient.delete(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete user error:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
};

// ── ADMIN: GET DASHBOARD STATISTICS ──
export const apiGetStats = async () => {
    try {
        const response = await httpClient.get('/users/admin/stats');
        return response.data.data || response.data || {};
    } catch (error) {
        console.error('Get stats error:', error);
        // Return default stats
        return {
            users: { totalUsers: 0, studentsCount: 0, organizersCount: 0 },
            events: { totalEvents: 0, pendingEvents: 0, approvedEvents: 0, rejectedEvents: 0, upcomingEvents: 0 },
            registrations: { totalRegistrations: 0, totalEventsWithRegistrations: 0, totalUniqueUsers: 0 },
            feedback: { totalFeedback: 0, averageRating: 0, eventsWithFeedback: 0, usersWithFeedback: 0 }
        };
    }
};

// ── ADMIN: GET ALL EVENTS ──
export const apiAdminGetAllEvents = async () => {
    try {
        const response = await httpClient.get('/events/admin/all');
        return {
            events: response.data.data || response.data || []
        };
    } catch (error) {
        console.error('Admin get all events error:', error);
        return { events: [] };
    }
};

// ── ADMIN: GET PENDING EVENTS ──
export const apiAdminGetPendingEvents = async () => {
    try {
        const response = await httpClient.get('/events/admin/pending');
        return {
            events: response.data.data || response.data || []
        };
    } catch (error) {
        console.error('Admin get pending events error:', error);
        return { events: [] };
    }
};

// ── ADMIN: APPROVE EVENT ──
export const apiAdminApproveEvent = async (id) => {
    const response = await httpClient.put(`/events/admin/${id}/approve`);
    return response.data;
};

// ── ADMIN: REJECT EVENT ──
export const apiAdminRejectEvent = async (id) => {
    const response = await httpClient.put(`/events/admin/${id}/reject`);
    return response.data;
};

// ── EXPORT ALL ──
const adminApi = {
    getUsers: apiGetUsers,
    deleteUser: apiDeleteUser,
    getStats: apiGetStats,
    getAllEvents: apiAdminGetAllEvents,
    getPendingEvents: apiAdminGetPendingEvents,
    approveEvent: apiAdminApproveEvent,
    rejectEvent: apiAdminRejectEvent
};

export default adminApi;