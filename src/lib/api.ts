// Minimal placeholder for @/lib/api to prevent import errors
// You should implement actual API logic as needed

const api = {
  stripeSettings: {
    async getSettings() { return {}; },
    async updateSettings(_settings: any) { return {}; },
  },
  emailSettings: {
    async getSettings() { return {}; },
    async updateSettings(_settings: any) { return {}; },
  },
  emailSubscribers: {
    async getSubscribers() { return []; },
    async deleteSubscriber(_id: string) { return {}; },
  },
  emailTemplates: {
    async getTemplates() { return []; },
  },
};

export default api;
