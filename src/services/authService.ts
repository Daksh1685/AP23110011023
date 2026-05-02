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

const REGISTRATION_URL =
  import.meta.env.VITE_REGISTRATION_URL ||
  import.meta.env.REACT_APP_REGISTRATION_URL ||
  'http://20.207.122.201/evaluation-service/register';

const AUTH_URL =
  import.meta.env.VITE_AUTH_URL ||
  import.meta.env.REACT_APP_AUTH_URL ||
  'http://20.207.122.201/evaluation-service/auth';

class AuthService {
  async register(payload: RegistrationPayload): Promise<RegistrationResult> {
    const response = await fetch(REGISTRATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Registration failed: ${response.status} ${errorText}`);
    }

    return (await response.json()) as RegistrationResult;
  }

  async authenticate(payload: AuthPayload): Promise<AuthResult> {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Authentication failed: ${response.status} ${errorText}`);
    }

    return (await response.json()) as AuthResult;
  }
}

export const authService = new AuthService();
