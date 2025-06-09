
import React from 'react';
import { useNotifications } from './NotificationsList/useNotifications';
import NotificationsTable from './NotificationsList/NotificationsTable';
import NotificationDetailsModal from './NotificationsList/NotificationDetailsModal';
import DeleteConfirmationDialog from './NotificationsList/DeleteConfirmationDialog';
import SyncStatusCard from './NotificationsList/SyncStatusCard';
import { EditNotificationForm } from './NotificationsList/EditNotificationForm';

interface NotificationsListProps {
  autoOpenNotification?: any;
}

const NotificationsList = ({ autoOpenNotification }: NotificationsListProps) => {
  const {
    notifications,
    isLoading,
    selectedNotification,
    editingNotification,
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
    cancelEdit,
    saveEditedNotification,
  } = useNotifications(autoOpenNotification);

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

      {/* Formulário de Edição */}
      {editingNotification && (
        <EditNotificationForm
          notification={editingNotification}
          onSave={saveEditedNotification}
          onCancel={cancelEdit}
          isLoading={isLoading}
        />
      )}

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
