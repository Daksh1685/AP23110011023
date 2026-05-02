import { Log } from '../log';
import { ApiErrorHandler } from '../utils/errorHandler';
import { authService } from './auth';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.REACT_APP_API_URL ||
  'http://localhost:3000/api';

const DEFAULT_TIMEOUT = 10000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions {
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  timeout?: number;
}

function buildQueryString(params?: Record<string, string | number | boolean>): string {
  if (!params) {
    return '';
  }

  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  return query ? `?${query}` : '';
}

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  body?: unknown,
  options: ApiRequestOptions = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const queryString = buildQueryString(options.params);
  const token = authService.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  await Log('frontend', 'debug', 'api', `Request ${method} ${url}${queryString}`);

  try {
    const response = await fetch(`${url}${queryString}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    const contentType = response.headers.get('content-type') || '';
    const data =
      contentType.includes('application/json') && responseText
        ? JSON.parse(responseText)
        : responseText;

    if (!response.ok) {
      const errorMessage =
        typeof data === 'string' && data.length > 0
          ? data
          : JSON.stringify(data);
      throw new Error(
        `HTTP ${response.status}: ${response.statusText}${
          errorMessage ? ` - ${errorMessage}` : ''
        }`
      );
    }

    await Log('frontend', 'debug', 'api', `Response ${method} ${url}${queryString} status ${response.status}`);
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    await ApiErrorHandler.handleError(error, `API request ${method} ${url}${queryString}`, 'api');
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    request<T>('GET', endpoint, undefined, options),
  post: <T>(endpoint: string, body: unknown, options?: ApiRequestOptions) =>
    request<T>('POST', endpoint, body, options),
  put: <T>(endpoint: string, body: unknown, options?: ApiRequestOptions) =>
    request<T>('PUT', endpoint, body, options),
  patch: <T>(endpoint: string, body: unknown, options?: ApiRequestOptions) =>
    request<T>('PATCH', endpoint, body, options),
  delete: <T>(endpoint: string, options?: ApiRequestOptions) =>
    request<T>('DELETE', endpoint, undefined, options)
};
