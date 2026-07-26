import httpClient from './httpClient';

// ── PUBLIC: GET ALL APPROVED EVENTS ──
export const apiGetEvents = async (params = {}) => {
    try {
        const response = await httpClient.get('/events', { params });
        return {
            events: response.data.data || response.data || []
        };
    } catch (error) {
        console.error('Get events error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
};

// ── PUBLIC: GET EVENT BY ID ──
export const apiGetEventById = async (id) => {
    try {
        const response = await httpClient.get(`/events/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get event error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch event');
    }
};

// ── ORGANIZER: GET MY EVENTS ──
export const apiGetMyEvents = async () => {
    try {
        const response = await httpClient.get('/events/my-events');
        return {
            events: response.data.data || response.data || []
        };
    } catch (error) {
        console.error('Get my events error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch your events');
    }
};

// ── ORGANIZER: CREATE EVENT ──
export const apiCreateEvent = async (eventData) => {
    try {
        const response = await httpClient.post('/events', eventData);
        return response.data;
    } catch (error) {
        console.error('Create event error:', error);
        throw new Error(error.response?.data?.message || 'Failed to create event');
    }
};

// ── ORGANIZER: UPDATE EVENT ──
export const apiUpdateEvent = async (id, eventData) => {
    try {
        const response = await httpClient.put(`/events/${id}`, eventData);
        return response.data;
    } catch (error) {
        console.error('Update event error:', error);
        throw new Error(error.response?.data?.message || 'Failed to update event');
    }
};

// ── ORGANIZER/ADMIN: DELETE EVENT ──
export const apiDeleteEvent = async (id) => {
    try {
        const response = await httpClient.delete(`/events/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete event error:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete event');
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
        throw new Error(error.response?.data?.message || 'Failed to fetch all events');
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
        throw new Error(error.response?.data?.message || 'Failed to fetch pending events');
    }
};

// ── ADMIN: APPROVE EVENT ──
export const apiApproveEvent = async (id) => {
    try {
        const response = await httpClient.put(`/events/admin/${id}/approve`);
        return response.data;
    } catch (error) {
        console.error('Approve event error:', error);
        throw new Error(error.response?.data?.message || 'Failed to approve event');
    }
};

// ── ADMIN: REJECT EVENT ──
export const apiRejectEvent = async (id) => {
    try {
        const response = await httpClient.put(`/events/admin/${id}/reject`);
        return response.data;
    } catch (error) {
        console.error('Reject event error:', error);
        throw new Error(error.response?.data?.message || 'Failed to reject event');
    }
};

// ── ADMIN: GET EVENT STATISTICS ──
export const apiAdminGetEventStats = async () => {
    try {
        const response = await httpClient.get('/events/admin/stats');
        return response.data;
    } catch (error) {
        console.error('Get event stats error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch event stats');
    }
};

// ── EXPORT ALL as object ──
const eventApi = {
    getEvents: apiGetEvents,
    getEventById: apiGetEventById,
    getMyEvents: apiGetMyEvents,
    createEvent: apiCreateEvent,
    updateEvent: apiUpdateEvent,
    deleteEvent: apiDeleteEvent,
    adminGetAllEvents: apiAdminGetAllEvents,
    adminGetPendingEvents: apiAdminGetPendingEvents,
    approveEvent: apiApproveEvent,
    rejectEvent: apiRejectEvent,
    adminGetStats: apiAdminGetEventStats
};

export default eventApi;