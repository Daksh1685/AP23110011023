export type NotificationType = 'Placement' | 'Result' | 'Event';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  type: NotificationType;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  type?: NotificationType;
}

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  type?: NotificationType;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface NotificationFetchParams {
  page?: number;
  limit?: number;
  type?: NotificationType | 'All';
}

export interface NotificationFetchResponse extends PaginatedResponse<Notification> {}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}
