const API_URL = window.location.origin;

const api = {
  getToken() {
    return localStorage.getItem('token');
  },

  authHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  },

  async request(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || 'Ошибка запроса');
    }

    return data;
  },

  async register(email, password, name) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    const headers = this.authHeaders();
    return this.request('/api/auth/logout', {
      method: 'POST',
      headers,
    });
  },

  async getMe() {
    const headers = this.authHeaders();
    const response = await this.request('/api/auth/me', { headers });
    return response.data?.user || response.user || response.data;
  },

  async getMyRooms() {
    const headers = this.authHeaders();
    const response = await this.request('/api/rooms/my', { headers });
    return response.data || [];
  },

  async getRooms() {
    const headers = this.authHeaders();
    const response = await this.request('/api/rooms', { headers });
    return response.data || [];
  },

  async createRoom(name) {
    const headers = this.authHeaders();
    const response = await this.request('/api/rooms', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name }),
    });
    return response.data;
  },

  async deleteRoom(id) {
    const headers = this.authHeaders();
    return this.request(`/api/rooms/${id}`, { method: 'DELETE', headers });
  },

  async getMessages(roomId) {
    const headers = this.authHeaders();
    const response = await this.request(`/api/rooms/${roomId}/messages`, { headers });
    return response.data || [];
  },
};
