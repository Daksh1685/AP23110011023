import React, { useEffect } from 'react';
import Header from '../components/Header';
import SendNotificationForm from '../components/SendNotificationForm';
import NotificationList from '../components/NotificationList';
import { useNotifications } from '../hooks/useNotifications';
import { usePageTracking } from '../hooks/usePageTracking';
import { CreateNotificationPayload } from '../types/notification';
import { notificationService } from '../services/notificationService';
import '../styles/components.css';

const Dashboard: React.FC = () => {
  const {
    notifications,
    isLoading,
    error,
    refresh
  } = useNotifications();

  usePageTracking({ pageName: 'Dashboard' });

  useEffect(() => {
    refresh();
  }, []);

  const handleCreateNotification = async (payload: CreateNotificationPayload) => {
    try {
      await notificationService.createNotification(payload);
      refresh();
    } catch (createError) {
      console.error('Failed to create notification', createError);
    }
  };

  return (
    <>
      <Header
        title="Notification System"
        subtitle="Manage your notifications efficiently"
      />

      <div className="container">
        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        <SendNotificationForm onSubmit={handleCreateNotification} />

        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
        />
      </div>
    </>
  );
};

export default Dashboard;
