const API_BASE = '';

export const api = {
  async get(url, options = {}) {
    return fetch(API_BASE + url, {
      ...options,
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  },

  async post(url, data, options = {}) {
    return fetch(API_BASE + url, {
      ...options,
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
  },
};

