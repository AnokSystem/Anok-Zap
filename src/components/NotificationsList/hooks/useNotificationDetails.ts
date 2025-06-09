
import { useState, useCallback } from 'react';
import { Notification } from '../types';

export const useNotificationDetails = () => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const viewNotificationDetails = useCallback((notification: Notification) => {
    console.log('👁️ Abrindo detalhes da notificação:', notification.ID);
    setSelectedNotification(notification);
  }, []);

  const closeNotificationDetails = useCallback(() => {
    console.log('❌ Fechando detalhes da notificação');
    setSelectedNotification(null);
  }, []);

  return {
    selectedNotification,
    viewNotificationDetails,
    closeNotificationDetails,
  };
};
