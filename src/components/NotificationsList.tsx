
import React from 'react';
import { useNotifications } from './NotificationsList/useNotifications';
import SyncStatusCard from './NotificationsList/SyncStatusCard';
import NotificationsTable from './NotificationsList/NotificationsTable';
import NotificationDetailsModal from './NotificationsList/NotificationDetailsModal';
import DeleteConfirmationDialog from './NotificationsList/DeleteConfirmationDialog';

const NotificationsList = () => {
  const {
    notifications,
    isLoading,
    selectedNotification,
    lastSync,
    syncStatus,
    deleteConfirmation,
    loadNotifications,
    showDeleteConfirmation,
    hideDeleteConfirmation,
    confirmDelete,
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
        onDelete={showDeleteConfirmation}
        onRefresh={loadNotifications}
      />

      <NotificationDetailsModal
        notification={selectedNotification}
        onClose={closeNotificationDetails}
      />

      <DeleteConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={hideDeleteConfirmation}
        onConfirm={confirmDelete}
        notificationId={deleteConfirmation.notificationId || ''}
      />
    </div>
  );
};

export default NotificationsList;
