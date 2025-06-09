
import { useState } from 'react';
import { Notification } from '../types';

export const useNotificationDetails = () => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const viewNotificationDetails = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  const closeNotificationDetails = () => {
    setSelectedNotification(null);
  };

  return {
    selectedNotification,
    viewNotificationDetails,
    closeNotificationDetails,
  };
};
