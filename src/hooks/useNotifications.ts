import { useEffect, useMemo, useState } from 'react';
import { logger } from '../services/logger';
import { notificationApi } from '../services/notificationApi';
import { notificationService } from '../services/notificationService';
import { Notification, NotificationType } from '../types/notification';
import { filterNotificationsByType, sortByPriority } from '../utils/notificationHelper';

interface UseNotificationsProps {
  priorityMode?: boolean;
}

export const useNotifications = ({ priorityMode = false }: UseNotificationsProps = {}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'All'>('All');
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await notificationApi.fetchNotifications({ page, limit, type: typeFilter });
      logger.info('ui', 'Notifications loaded', { page, limit, typeFilter, count: response.data.length });

      const filtered = filterNotificationsByType(response.data, typeFilter);
      const sorted = priorityMode ? sortByPriority(filtered) : filtered;

      setNotifications(sorted);
      setTotal(response.total);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Unable to load notifications';
      logger.warn('api', 'API unavailable, using local fallback', { error: message });

      try {
        const fallbackNotifications = await notificationService.getNotifications(page, limit);
        const filteredFallback = filterNotificationsByType(fallbackNotifications, typeFilter);
        const sortedFallback = priorityMode ? sortByPriority(filteredFallback) : filteredFallback;

        setNotifications(sortedFallback);
        setTotal(fallbackNotifications.length);
        logger.info('ui', 'Loaded notifications from local fallback storage', {
          page,
          limit,
          typeFilter,
          count: fallbackNotifications.length
        });
      } catch (fallbackError) {
        const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : 'Unable to load fallback notifications';
        setError(fallbackMessage);
        logger.error('error', 'Failed to load fallback notifications', { error: fallbackMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, [page, limit, typeFilter, priorityMode]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    logger.info('interaction', 'Page changed', { page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    logger.info('interaction', 'Page size changed', { limit: newLimit });
  };

  const handleTypeFilterChange = (newType: NotificationType | 'All') => {
    setTypeFilter(newType);
    setPage(1);
    logger.info('interaction', 'Type filter changed', { type: newType });
  };

  const refresh = () => {
    void loadNotifications();
    logger.debug('ui', 'Refreshing notification list');
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  return {
    notifications,
    page,
    limit,
    total,
    typeFilter,
    isLoading,
    error,
    unreadCount,
    setPage: handlePageChange,
    setLimit: handleLimitChange,
    setTypeFilter: handleTypeFilterChange,
    refresh
  };
};
