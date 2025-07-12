// Enhanced stub for API utility. Replace with real implementation as needed.
export const api = {
  stripeSettings: {
    getSettings: async () => ({}),
    updateSettings: async (_settings: any) => {},
  },
  emailSettings: {
    getSettings: async () => ({}),
    updateSettings: async (_settings: any) => {},
  },
  emailSubscribers: {
    getSubscribers: async () => [],
    deleteSubscriber: async (_id: string) => {},
    unsubscribe: async (_email: string) => {},
  },
  emailTemplates: {
    getTemplates: async () => [],
  },
};
