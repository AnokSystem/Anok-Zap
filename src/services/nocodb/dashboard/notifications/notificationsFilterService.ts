
import { BaseNotificationsService } from './baseNotificationsService';

export class NotificationsFilterService extends BaseNotificationsService {
  filterByUser(notifications: any[]): any[] {
    const { userId, clientId } = this.getUserInfo();
    
    console.log('🔍 Filtrando notificações para usuário:', { userId, clientId });
    
    const userNotifications = notifications.filter(n => {
      const recordClientId = n['Cliente ID'] || n.client_id;
      
      console.log('🔍 Analisando notificação:', {
        recordId: n.id || n.Id,
        recordClientId,
        currentUserId: userId,
        currentClientId: clientId
      });
      
      const belongsToUser = recordClientId === userId || recordClientId === clientId;
      
      console.log('📋 Resultado da verificação:', {
        recordId: n.id || n.Id,
        belongsToUser,
        reason: belongsToUser ? 'INCLUÍDA' : 'EXCLUÍDA',
        matchedWith: recordClientId === userId ? 'userId' : recordClientId === clientId ? 'clientId' : 'nenhum'
      });
      
      return belongsToUser;
    });
    
    console.log(`✅ ${userNotifications.length} notificações filtradas para usuário ${userId}/${clientId}`);
    return userNotifications;
  }

  applyFilters(notifications: any[], filters: {
    dateFrom?: string;
    dateTo?: string;
    eventType?: string;
    platform?: string;
    status?: string;
  }): any[] {
    let filteredData = notifications;
    
    if (filters.dateFrom) {
      filteredData = filteredData.filter(n => {
        const notificationDate = new Date(n.event_date || n.CreatedAt || n.created_at);
        return notificationDate >= new Date(filters.dateFrom!);
      });
    }
    
    if (filters.dateTo) {
      filteredData = filteredData.filter(n => {
        const notificationDate = new Date(n.event_date || n.CreatedAt || n.created_at);
        return notificationDate <= new Date(filters.dateTo!);
      });
    }
    
    if (filters.eventType) {
      filteredData = filteredData.filter(n => 
        (n.event_type || '').toLowerCase().includes(filters.eventType!.toLowerCase())
      );
    }
    
    if (filters.platform) {
      filteredData = filteredData.filter(n => 
        (n.platform || '').toLowerCase().includes(filters.platform!.toLowerCase())
      );
    }
    
    if (filters.status) {
      filteredData = filteredData.filter(n => 
        (n.status || '').toLowerCase().includes(filters.status!.toLowerCase())
      );
    }
    
    console.log(`🔍 ${filteredData.length} notificações após aplicar filtros`);
    return filteredData;
  }
}
