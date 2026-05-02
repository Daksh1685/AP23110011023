import { Log } from '../log';
import { ApiErrorHandler } from '../utils/errorHandler';

export interface RegistrationPayload {
  email: string;
  name: string;
  mobileNo: string;
  githubUsername: string;
  rollNo: string;
  accessCode: string;
}

export interface RegistrationResult {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}

export interface AuthPayload {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}

export interface AuthResult {
  access_token: string;
  expires_in: number;
  token_type: string;
}

const AUTH_URL =
  import.meta.env.VITE_AUTH_URL ||
  import.meta.env.REACT_APP_AUTH_URL ||
  'http://20.207.122.201/evaluation-service/auth';

const REGISTRATION_URL =
  import.meta.env.VITE_REGISTRATION_URL ||
  import.meta.env.REACT_APP_REGISTRATION_URL ||
  'http://20.207.122.201/evaluation-service/register';

const TOKEN_STORAGE_KEY = 'notification_app_auth_token';

class AuthService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  private saveToken(token: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  async authenticate(payload: AuthPayload): Promise<AuthResult> {
    try {
      await Log('frontend', 'info', 'auth', 'Sending authentication request');

      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const message = data?.message || response.statusText;
        throw new Error(`Authentication failed: ${response.status} ${message}`);
      }

      const authResult = data as AuthResult;
      this.saveToken(authResult.access_token);
      await Log('frontend', 'info', 'auth', 'Authentication succeeded');
      return authResult;
    } catch (error) {
      await ApiErrorHandler.handleError(error, 'Authentication failed', 'auth');
      throw error;
    }
  }

  async register(payload: RegistrationPayload): Promise<RegistrationResult> {
    try {
      await Log('frontend', 'info', 'auth', 'Sending registration request');

      const response = await fetch(REGISTRATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const message = data?.message || response.statusText;
        throw new Error(`Registration failed: ${response.status} ${message}`);
      }

      await Log('frontend', 'info', 'auth', 'Registration succeeded');
      return data as RegistrationResult;
    } catch (error) {
      await ApiErrorHandler.handleError(error, 'Registration failed', 'auth');
      throw error;
    }
  }
}

export const authService = new AuthService();
