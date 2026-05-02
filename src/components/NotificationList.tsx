import React from 'react';
import { Notification } from '../types/notification';
import NotificationCard from './NotificationCard';
import '../styles/components.css';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loader"></div>
        <p style={styles.loadingText}>Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIcon}>📭</div>
        <h3 style={styles.emptyTitle}>No Notifications</h3>
        <p style={styles.emptyMessage}>
          You're all caught up! Create a new notification to get started.
        </p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Notifications ({notifications.length})</h2>
        {unreadCount > 0 && (
          <span className="badge badge-primary">
            {unreadCount} unread
          </span>
        )}
      </div>

      <div style={styles.list}>
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
          />
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: 'var(--spacing-lg)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--spacing-lg)',
    paddingBottom: 'var(--spacing-md)',
    borderBottom: '2px solid var(--neutral-200)'
  },
  title: {
    margin: 0,
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--neutral-900)'
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-2xl) var(--spacing-lg)',
    minHeight: '400px'
  },
  loadingText: {
    marginTop: 'var(--spacing-md)',
    fontSize: 'var(--font-size-lg)',
    color: 'var(--neutral-500)'
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-2xl) var(--spacing-lg)',
    minHeight: '400px',
    backgroundColor: 'var(--neutral-50)',
    borderRadius: 'var(--border-radius-lg)',
    border: '2px dashed var(--neutral-200)'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: 'var(--spacing-md)'
  },
  emptyTitle: {
    margin: '0 0 var(--spacing-sm) 0',
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--neutral-700)'
  },
  emptyMessage: {
    margin: 0,
    fontSize: 'var(--font-size-base)',
    color: 'var(--neutral-500)',
    textAlign: 'center' as const
  }
};

export default NotificationList;
