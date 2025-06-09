
import { useEffect } from 'react';
import { Notification } from '../types';

export const useAutoOpenNotification = (
  autoOpenNotification: any,
  notifications: Notification[],
  setSelectedNotification: (notification: Notification) => void
) => {
  useEffect(() => {
    if (autoOpenNotification && notifications.length > 0) {
      console.log('🔍 Procurando notificação para abrir automaticamente:', autoOpenNotification);
      
      // Tentar encontrar a notificação correspondente pelo ID
      const matchingNotification = notifications.find(n => 
        n.ID === autoOpenNotification.ID || 
        n.ID === autoOpenNotification.id
      );
      
      if (matchingNotification) {
        console.log('✅ Notificação encontrada, abrindo automaticamente:', matchingNotification);
        setSelectedNotification(matchingNotification);
      } else {
        console.log('⚠️ Notificação não encontrada na lista atual');
      }
    }
  }, [autoOpenNotification, notifications, setSelectedNotification]);
};
