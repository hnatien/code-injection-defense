export const api = {
  get: async (url) => {
    return fetch(url);
  },
  post: async (url, data) => {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
};
