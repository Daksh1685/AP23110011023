import { Notification, NotificationType } from '../types/notification';

const typePriority: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1
};

export const getNotificationPriority = (notification: Notification): number => {
  const typeScore = typePriority[notification.type] ?? 0;
  const timestampScore = new Date(notification.timestamp).getTime();
  return typeScore * 1_000_000_000 + timestampScore;
};

export const sortByPriority = (notifications: Notification[]): Notification[] => {
  return [...notifications].sort((left, right) => {
    const leftScore = getNotificationPriority(left);
    const rightScore = getNotificationPriority(right);

    return rightScore - leftScore;
  });
};

export const filterNotificationsByType = (
  notifications: Notification[],
  type: NotificationType | 'All'
): Notification[] => {
  if (type === 'All') {
    return notifications;
  }

  return notifications.filter((notification) => notification.type === type);
};
