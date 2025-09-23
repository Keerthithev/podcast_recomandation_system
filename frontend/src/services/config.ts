export const API_CONFIG = {
    BASE_URL: 'http://localhost:8000/api/v1',
    ENDPOINTS: {
        PODCASTS: '/podcasts',
        RECOMMENDATIONS: '/users/:userId/recommendations',
        INTERACTIONS: '/users/:userId/interact',
        PREFERENCES: '/users/:userId/preferences'
    }
};
