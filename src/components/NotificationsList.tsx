
import React from 'react';
import { useNotifications } from './NotificationsList/useNotifications';
import NotificationsTable from './NotificationsList/NotificationsTable';
import NotificationDetailsModal from './NotificationsList/NotificationDetailsModal';
import DeleteConfirmationDialog from './NotificationsList/DeleteConfirmationDialog';
import SyncStatusCard from './NotificationsList/SyncStatusCard';

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
    editNotification,
  } = useNotifications();

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <SyncStatusCard
        lastSync={lastSync}
        syncStatus={syncStatus}
        onRefresh={loadNotifications}
        notifications={notifications}
        isLoading={isLoading}
      />

      {/* Tabela de Notificações */}
      <NotificationsTable
        notifications={notifications}
        isLoading={isLoading}
        onViewDetails={viewNotificationDetails}
        onDelete={showDeleteConfirmation}
        onEdit={editNotification}
        onRefresh={loadNotifications}
      />

      {/* Modal de Detalhes */}
      {selectedNotification && (
        <NotificationDetailsModal
          notification={selectedNotification}
          onClose={closeNotificationDetails}
        />
      )}

      {/* Dialog de Confirmação de Exclusão */}
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
