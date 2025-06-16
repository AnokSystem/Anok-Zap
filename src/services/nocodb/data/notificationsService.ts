
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';

export class NotificationsService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  private NOTIFICACOES_PLATAFORMAS_TABLE_ID = 'mzup2t8ygoiy5ub';

  private getClientId(): string {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
  }

  async saveNotificationFromPlatform(baseId: string, notificationData: any): Promise<boolean> {
    try {
      console.log('💾 Salvando notificação da plataforma no NocoDB...');
      console.log('📋 Dados recebidos:', notificationData);
      
      const clientId = this.getClientId();
      console.log('🏢 Client ID identificado:', clientId);
      
      const data = {
        client_id: clientId,
        platform: notificationData.platform || 'hotmart',
        event_type: notificationData.event_type || notificationData.eventType || 'purchase',
        transaction_id: notificationData.transaction_id || notificationData.transactionId,
        product_id: notificationData.product_id || notificationData.productId,
        product_name: notificationData.product_name || notificationData.productName,
        customer_name: notificationData.customer_name || notificationData.customerName,
        customer_email: notificationData.customer_email || notificationData.customerEmail,
        customer_phone: notificationData.customer_phone || notificationData.customerPhone,
        value: notificationData.value || notificationData.amount || 0,
        currency: notificationData.currency || 'BRL',
        commission_value: notificationData.commission_value || notificationData.commissionValue || 0,
        status: notificationData.status || 'approved',
        event_date: notificationData.event_date || notificationData.eventDate || new Date().toISOString(),
        processed: false,
        webhook_data: JSON.stringify(notificationData),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Dados formatados para salvar:', data);
      console.log('🎯 Usando tabela específica ID:', this.NOTIFICACOES_PLATAFORMAS_TABLE_ID);
      
      const success = await this.saveToTable(baseId, this.NOTIFICACOES_PLATAFORMAS_TABLE_ID, data);
      if (success) {
        console.log('✅ Notificação da plataforma salva com sucesso');
        return true;
      } else {
        console.log('❌ Falha ao salvar no NocoDB');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro geral ao salvar notificação:', error);
      return false;
    }
  }

  private async saveToTable(baseId: string, tableId: string, data: any): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`;
      
      console.log('📡 Fazendo POST para:', url);
      console.log('📋 Dados a enviar:', JSON.stringify(data, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Dados salvos com sucesso:', result);
        return true;
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro ao salvar (${response.status}):`, errorText);
        
        console.log('❌ Headers enviados:', this.headers);
        console.log('❌ URL tentativa:', url);
        console.log('❌ Dados enviados:', data);
        
        return false;
      }
    } catch (error) {
      console.log('❌ Erro interno ao salvar:', error);
      return false;
    }
  }
}
