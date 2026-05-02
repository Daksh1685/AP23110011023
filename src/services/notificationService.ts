import { Notification, CreateNotificationPayload, NotificationResponse, PaginatedResponse } from '../types/notification';
import { api } from './api';
import { ApiErrorHandler } from '../utils/errorHandler';
import { localStorageService } from './storageService';

const STORAGE_KEY = 'notifications';
const USE_LOCAL_STORAGE = true; // Switch to false when backend is ready

class NotificationService {
  private async loadNotifications(): Promise<NotificationResponse[]> {
    const stored = await localStorageService.getItem<NotificationResponse[]>(STORAGE_KEY);
    return stored ?? [];
  }

  private async saveNotifications(notifications: NotificationResponse[]): Promise<void> {
    await localStorageService.setItem(STORAGE_KEY, notifications);
  }

  private getDefaultNotifications(): NotificationResponse[] {
    const now = Date.now();
    return [
      {
        id: 'sample-1',
        title: 'Welcome to your notification center',
        message: 'Create a notification to get started, or edit this sample anytime.',
        priority: 'high',
        type: 'Event',
        timestamp: new Date(now - 1000 * 60 * 10).toISOString(),
        read: false
      },
      {
        id: 'sample-2',
        title: 'Platform update available',
        message: 'Your notification app is now configured with local fallback storage.',
        priority: 'medium',
        type: 'Event',
        timestamp: new Date(now - 1000 * 60 * 30).toISOString(),
        read: false
      },
      {
        id: 'sample-3',
        title: 'No backend configured yet',
        message: 'Notifications are currently stored locally until your API is connected.',
        priority: 'low',
        type: 'Event',
        timestamp: new Date(now - 1000 * 60 * 60).toISOString(),
        read: true
      }
    ];
  }

  private async initializeDefaultNotifications(): Promise<NotificationResponse[]> {
    const defaultNotifications = this.getDefaultNotifications();
    await this.saveNotifications(defaultNotifications);
    return defaultNotifications;
  }

  async getNotifications(page: number = 1, limit: number = 10): Promise<Notification[]> {
    try {
      if (USE_LOCAL_STORAGE) {
        let allNotifications = await this.loadNotifications();
        if (allNotifications.length === 0) {
          allNotifications = await this.initializeDefaultNotifications();
        }
        const start = (page - 1) * limit;
        const paginated = allNotifications.slice(start, start + limit);
        return paginated.map(this.mapNotificationResponse);
      }

      const response = await api.get<PaginatedResponse<NotificationResponse>>('/notifications', {
        params: { page, limit }
      });
      return response.data.map(this.mapNotificationResponse);
    } catch (error) {
      await ApiErrorHandler.handleError(error, 'Failed to fetch notifications', 'api');
      throw error;
    }
  }

  async getNotificationById(id: string): Promise<Notification> {
    try {
      if (USE_LOCAL_STORAGE) {
        const notifications = await this.loadNotifications();
        const notification = notifications.find((item) => item.id === id);
        if (!notification) {
          throw new Error('Notification not found');
        }
        return this.mapNotificationResponse(notification);
      }

      const response = await api.get<NotificationResponse>(`/notifications/${id}`);
      return this.mapNotificationResponse(response);
    } catch (error) {
      await ApiErrorHandler.handleError(error, `Failed to fetch notification ${id}`, 'api');
      throw error;
    }
  }

  async createNotification(payload: CreateNotificationPayload): Promise<Notification> {
    try {
      if (USE_LOCAL_STORAGE) {
        const notifications = await this.loadNotifications();
        const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const newNotification: NotificationResponse = {
          id,
          title: payload.title,
          message: payload.message,
          priority: payload.priority || 'medium',
          timestamp: new Date().toISOString(),
          read: false
        };
        const updated = [newNotification, ...notifications];
        await this.saveNotifications(updated);
        return this.mapNotificationResponse(newNotification);
      }

      const response = await api.post<NotificationResponse>('/notifications', {
        title: payload.title,
        message: payload.message,
        priority: payload.priority || 'medium',
        timestamp: new Date().toISOString()
      });
      return this.mapNotificationResponse(response);
    } catch (error) {
      await ApiErrorHandler.handleError(error, 'Failed to create notification', 'api');
      throw error;
    }
  }

  async updateNotification(id: string, payload: Partial<CreateNotificationPayload>): Promise<Notification> {
    try {
      if (USE_LOCAL_STORAGE) {
        const notifications = await this.loadNotifications();
        const index = notifications.findIndex((item) => item.id === id);
        if (index === -1) {
          throw new Error('Notification not found');
        }
        const updatedNotification: NotificationResponse = {
          ...notifications[index],
          ...payload,
          timestamp: new Date().toISOString()
        };
        notifications[index] = updatedNotification;
        await this.saveNotifications(notifications);
        return this.mapNotificationResponse(updatedNotification);
      }

      const response = await api.put<NotificationResponse>(`/notifications/${id}`, payload);
      return this.mapNotificationResponse(response);
    } catch (error) {
      await ApiErrorHandler.handleError(error, `Failed to update notification ${id}`, 'api');
      throw error;
    }
  }

  async deleteNotification(id: string): Promise<void> {
    try {
      if (USE_LOCAL_STORAGE) {
        const notifications = await this.loadNotifications();
        const updated = notifications.filter((item) => item.id !== id);
        await this.saveNotifications(updated);
        return;
      }

      await api.delete<void>(`/notifications/${id}`);
    } catch (error) {
      await ApiErrorHandler.handleError(error, `Failed to delete notification ${id}`, 'api');
      throw error;
    }
  }

  async markAsRead(id: string): Promise<Notification> {
    try {
      if (USE_LOCAL_STORAGE) {
        const notifications = await this.loadNotifications();
        const index = notifications.findIndex((item) => item.id === id);
        if (index === -1) {
          throw new Error('Notification not found');
        }
        notifications[index].read = true;
        await this.saveNotifications(notifications);
        return this.mapNotificationResponse(notifications[index]);
      }

      const response = await api.patch<NotificationResponse>(`/notifications/${id}/read`, {});
      return this.mapNotificationResponse(response);
    } catch (error) {
      await ApiErrorHandler.handleError(error, `Failed to mark notification as read: ${id}`, 'api');
      throw error;
    }
  }

  private mapNotificationResponse(data: NotificationResponse): Notification {
    return {
      id: data.id,
      title: data.title,
      message: data.message,
      timestamp: data.timestamp,
      read: data.read,
      priority: data.priority,
      type: data.type ?? 'Event'
    };
  }
}

export const notificationService = new NotificationService();
