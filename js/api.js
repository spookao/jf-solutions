const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5001/api' 
    : '/api';

const api = {
    // Testimonials
    async getTestimonials() {
        try {
            const response = await fetch(`${API_URL}/testimonials`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            return [];
        }
    },

    // Messages
    async sendMessage(data) {
        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    // Content
    async getContent(key) {
        try {
            const response = await fetch(`${API_URL}/content/${key}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching content ${key}:`, error);
            return null;
        }
    }
};
