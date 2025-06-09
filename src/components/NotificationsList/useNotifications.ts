
import { useEffect } from 'react';
import { useNotificationLoading } from './hooks/useNotificationLoading';
import { useNotificationDeletion } from './hooks/useNotificationDeletion';
import { useNotificationDetails } from './hooks/useNotificationDetails';
import { useNotificationEditing } from './hooks/useNotificationEditing';
import { useAutoOpenNotification } from './hooks/useAutoOpenNotification';

export const useNotifications = (autoOpenNotification?: any) => {
  const {
    notifications,
    setNotifications,
    isLoading: loadingState,
    lastSync,
    syncStatus,
    loadNotifications,
  } = useNotificationLoading();

  const {
    deleteConfirmation,
    showDeleteConfirmation,
    hideDeleteConfirmation,
    confirmDelete,
  } = useNotificationDeletion(setNotifications);

  const {
    selectedNotification,
    viewNotificationDetails,
    closeNotificationDetails,
  } = useNotificationDetails();

  const {
    editingNotification,
    isLoading: editingLoading,
    editNotification,
    cancelEdit,
    saveEditedNotification,
  } = useNotificationEditing(setNotifications, loadNotifications);

  useAutoOpenNotification(autoOpenNotification, notifications, viewNotificationDetails);

  // Combine loading states
  const isLoading = loadingState || editingLoading;

  useEffect(() => {
    console.log('🚀 NotificationsList montado, carregando notificações...');
    loadNotifications();

    // Escutar evento de refresh
    const handleRefresh = () => {
      console.log('🔄 Evento de refresh recebido');
      loadNotifications();
    };

    window.addEventListener('refreshNotifications', handleRefresh);
    return () => window.removeEventListener('refreshNotifications', handleRefresh);
  }, []);

  return {
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
  };
};
