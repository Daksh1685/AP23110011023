import { logger } from './logger';
import { Notification, NotificationFetchParams, NotificationFetchResponse } from '../types/notification';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://20.207.122.201/evaluation-service';
const AUTH_TOKEN = import.meta.env.VITE_API_TOKEN ?? '';

const buildUrl = (endpoint: string, params?: Record<string, string | number | undefined>): string => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== 'All') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
};

const handleResponse = async (response: Response): Promise<any> => {
  const text = await response.text();
  let payload: unknown = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch (error) {
    logger.error('api', 'Failed to parse API response', { error, responseText: text });
    throw new Error('Invalid JSON response from API');
  }

  if (!response.ok) {
    logger.error('api', 'API returned error status', { status: response.status, body: payload });
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  return payload;
};

export const notificationApi = {
  async fetchNotifications(params: NotificationFetchParams = {}): Promise<NotificationFetchResponse> {
    const category = 'api';
    const { page = 1, limit = 10, type = 'All' } = params;
    const url = buildUrl('/notifications', { page, limit, type });

    logger.info(category, 'Fetching notifications', { url, page, limit, type });

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {})
        }
      });

      const payload = await handleResponse(response);
      const rawData: unknown[] = Array.isArray(payload) ? payload : payload?.data ?? [];
      const data: Notification[] = rawData.map((item) => {
        const record = item as Partial<Notification>;
        return {
          id: record.id ?? String(Math.random()),
          title: record.title ?? 'Untitled notification',
          message: record.message ?? 'No message provided',
          timestamp: record.timestamp ?? new Date().toISOString(),
          read: typeof record.read === 'boolean' ? record.read : false,
          priority: record.priority ?? 'medium',
          type: record.type ?? 'Event'
        };
      });
      const total: number = typeof payload?.total === 'number' ? payload.total : data.length;
      const responsePage: number = typeof payload?.page === 'number' ? payload.page : page;
      const responseLimit: number = typeof payload?.limit === 'number' ? payload.limit : limit;

      logger.info(category, 'Fetched notifications successfully', {
        count: data.length,
        total,
        page: responsePage,
        limit: responseLimit
      });

      return {
        data,
        total,
        page: responsePage,
        limit: responseLimit
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(category, 'Failed to fetch notifications', { error: message });
      throw error;
    }
  }
};
