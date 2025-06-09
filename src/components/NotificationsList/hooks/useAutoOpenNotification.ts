
import { useEffect } from 'react';
import { Notification } from '../types';

export const useAutoOpenNotification = (
  autoOpenNotification: any,
  notifications: Notification[],
  viewNotificationDetails: (notification: Notification) => void
) => {
  useEffect(() => {
    if (autoOpenNotification && notifications.length > 0) {
      console.log('🎯 Tentando abrir notificação automaticamente:', autoOpenNotification);
      
      // Procurar a notificação correspondente na lista
      let targetNotification = notifications.find(n => n.ID === autoOpenNotification.ID);
      
      // Se não encontrou por ID, tentar encontrar por outros critérios
      if (!targetNotification && autoOpenNotification['Perfil Hotmart']) {
        targetNotification = notifications.find(n => 
          n['Perfil Hotmart'] === autoOpenNotification['Perfil Hotmart'] &&
          n['Tipo de Evento'] === autoOpenNotification['Tipo de Evento']
        );
      }
      
      // Se ainda não encontrou, usar a própria notificação recebida
      if (!targetNotification) {
        console.log('📋 Usando notificação fornecida diretamente');
        targetNotification = autoOpenNotification as Notification;
      }
      
      if (targetNotification) {
        console.log('✅ Abrindo notificação encontrada:', targetNotification.ID);
        // Pequeno delay para garantir que o componente foi montado
        setTimeout(() => {
          viewNotificationDetails(targetNotification!);
        }, 100);
      } else {
        console.log('❌ Notificação não encontrada para abertura automática');
      }
    }
  }, [autoOpenNotification, notifications, viewNotificationDetails]);
};
