// API configuration with Auth0 token handling
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5125';

class ApiService {
  private async getAuthHeader(): Promise<Record<string, string>> {
    const token = localStorage.getItem('auth0_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async get(endpoint: string) {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { data };
  }

  async post(endpoint: string, data: unknown) {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const responseData = await response.json();
    return { data: responseData };
  }

  async put(endpoint: string, data: unknown) {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    // PUT might not return content
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async delete(endpoint: string) {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    // DELETE might not return content
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }
}

const api = new ApiService();
export default api;
