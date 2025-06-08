
import React from 'react';
import { useNotifications } from './NotificationsList/useNotifications';
import SyncStatusCard from './NotificationsList/SyncStatusCard';
import NotificationsTable from './NotificationsList/NotificationsTable';
import NotificationDetailsModal from './NotificationsList/NotificationDetailsModal';

const NotificationsList = () => {
  const {
    notifications,
    isLoading,
    selectedNotification,
    lastSync,
    syncStatus,
    loadNotifications,
    deleteNotification,
    viewNotificationDetails,
    closeNotificationDetails,
  } = useNotifications();

  return (
    <div className="space-y-6">
      <SyncStatusCard
        syncStatus={syncStatus}
        lastSync={lastSync}
        notifications={notifications}
        isLoading={isLoading}
        onRefresh={loadNotifications}
      />

      <NotificationsTable
        notifications={notifications}
        isLoading={isLoading}
        onViewDetails={viewNotificationDetails}
        onDelete={deleteNotification}
        onRefresh={loadNotifications}
      />

      <NotificationDetailsModal
        notification={selectedNotification}
        onClose={closeNotificationDetails}
      />
    </div>
  );
};

export default NotificationsList;
