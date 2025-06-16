
import { ClientService } from './clientService';
import { NocodbConfig } from '../types';

export class MessagingService extends ClientService {
  private DISPARO_EM_MASSA_TABLE_ID = 'myx4lsmm5i02xcd';

  constructor(config: NocodbConfig) {
    super(config);
  }

  async saveMassMessagingLog(baseId: string, campaignData: any): Promise<boolean> {
    try {
      console.log('💾 Salvando log de disparo em massa no NocoDB...');
      console.log('📋 Dados recebidos:', campaignData);
      
      const clientId = this.getClientId();
      console.log('🏢 Client ID identificado:', clientId);
      
      const data = {
        client_id: clientId,
        campaign_id: campaignData.campaign_id || `campanha_${Date.now()}`,
        campaign_name: campaignData.campaign_name || `Campanha ${new Date().toLocaleString('pt-BR')}`,
        instance_id: campaignData.instance_id || campaignData.instance,
        instance_name: campaignData.instance_name || campaignData.instance,
        message_type: campaignData.message_type || campaignData.messages?.[0]?.type || 'text',
        recipient_count: campaignData.recipient_count || campaignData.recipients?.length || 0,
        sent_count: campaignData.sent_count || 0,
        error_count: campaignData.error_count || 0,
        delay: campaignData.delay || 5000,
        status: campaignData.status || 'iniciado',
        start_time: campaignData.start_time || new Date().toISOString(),
        notification_phone: campaignData.notificationPhone,
        data_json: JSON.stringify(campaignData),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Dados formatados para salvar:', data);
      console.log('🎯 Usando tabela específica ID:', this.DISPARO_EM_MASSA_TABLE_ID);
      
      const success = await this.saveToTable(baseId, this.DISPARO_EM_MASSA_TABLE_ID, data);
      if (success) {
        console.log('✅ Log de disparo em massa salvo com sucesso na tabela específica');
        return true;
      } else {
        console.log('❌ Falha ao salvar na tabela específica');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro geral ao salvar log:', error);
      return false;
    }
  }

  async getRecentDisparos(baseId: string, limit: number = 10): Promise<any[]> {
    try {
      const clientId = this.getClientId();
      
      console.log('📨 Buscando disparos recentes para cliente:', clientId);
      console.log('🎯 Usando tabela específica ID:', this.DISPARO_EM_MASSA_TABLE_ID);

      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.DISPARO_EM_MASSA_TABLE_ID}?limit=${limit}&sort=-CreatedAt`;
      console.log('📡 URL de busca:', url);
      
      const response = await fetch(url, {
        headers: this.headers,
      });

      if (response.ok) {
        const data = await response.json();
        const disparos = data.list || [];
        
        console.log(`📊 ${disparos.length} disparos encontrados na tabela`);
        
        const clientDisparos = disparos.filter(d => {
          const hasClientId = d.client_id === clientId || 
                             d.Client_id === clientId || 
                             d.clientId === clientId;
          return hasClientId || disparos.length < 50;
        });
        
        console.log(`✅ ${clientDisparos.length} disparos encontrados para cliente ${clientId}`);
        return clientDisparos;
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro ao buscar disparos (${response.status}):`, errorText);
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao buscar disparos recentes:', error);
      return [];
    }
  }
}
