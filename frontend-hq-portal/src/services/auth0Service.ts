import axios from 'axios';
import { auth0Config } from '../config/auth0';

class Auth0Service {
  private domain = auth0Config.domain;
  private clientId = auth0Config.clientId;
  private audience = auth0Config.audience;
  private redirectUri = auth0Config.redirectUri;

  // Login with email and password using Resource Owner Password Grant
  async loginWithPassword(email: string, password: string) {
    try {
      const response = await axios.post(
        `https://${this.domain}/oauth/token`,
        {
          grant_type: 'password',
          username: email,
          password: password,
          client_id: this.clientId,
          audience: this.audience,
          scope: 'openid profile email'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.error_description) {
        throw new Error(error.response.data.error_description);
      }
      throw error;
    }
  }

  // Sign up new user
  async signup(email: string, password: string, firstName?: string, lastName?: string) {
    try {
      const response = await axios.post(
        `https://${this.domain}/dbconnections/signup`,
        {
          client_id: this.clientId,
          email: email,
          password: password,
          connection: 'Username-Password-Authentication',
          user_metadata: {
            firstName: firstName,
            lastName: lastName
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.description) {
        throw new Error(error.response.data.description);
      }
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email: string) {
    try {
      const response = await axios.post(
        `https://${this.domain}/dbconnections/change_password`,
        {
          client_id: this.clientId,
          email: email,
          connection: 'Username-Password-Authentication'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.description) {
        throw new Error(error.response.data.description);
      }
      throw error;
    }
  }

  // Get user info from token
  async getUserInfo(accessToken: string) {
    const response = await axios.get(
      `https://${this.domain}/userinfo`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return response.data;
  }
}

export default new Auth0Service();