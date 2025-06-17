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
        contacts_reached: campaignData.status === 'enviando' ? 0 : (campaignData.contacts_reached || 0),
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
        
        // Forçar atualização do cache/dados no dashboard
        setTimeout(() => {
          console.log('🔄 Disparando evento de atualização do dashboard...');
          window.dispatchEvent(new CustomEvent('dashboardRefresh'));
        }, 1000);
        
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

  async updateContactsReached(baseId: string, campaignId: string, contactsReached: number, status: string = 'enviando'): Promise<boolean> {
    try {
      console.log(`🔄 Atualizando contatos alcançados: ${contactsReached} para campanha ${campaignId}`);
      
      // Buscar o registro da campanha pelo campaign_id
      const searchUrl = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.DISPARO_EM_MASSA_TABLE_ID}?where=(campaign_id,eq,${campaignId})`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: this.headers,
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const records = searchData.list || [];
        
        if (records.length > 0) {
          const recordId = records[0].Id || records[0].ID || records[0].id;
          
          // Atualizar o registro
          const updateData = {
            contacts_reached: contactsReached,
            status: status,
            updated_at: new Date().toISOString()
          };
          
          const updateUrl = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.DISPARO_EM_MASSA_TABLE_ID}/${recordId}`;
          
          const updateResponse = await fetch(updateUrl, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify(updateData),
          });

          if (updateResponse.ok) {
            console.log('✅ Contatos alcançados atualizados com sucesso');
            
            // Disparar evento de atualização do dashboard
            window.dispatchEvent(new CustomEvent('dashboardRefresh'));
            
            return true;
          } else {
            const errorText = await updateResponse.text();
            console.error('❌ Erro ao atualizar contatos alcançados:', errorText);
            return false;
          }
        } else {
          console.error('❌ Campanha não encontrada para atualização');
          return false;
        }
      } else {
        const errorText = await searchResponse.text();
        console.error('❌ Erro ao buscar campanha para atualização:', errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro geral ao atualizar contatos alcançados:', error);
      return false;
    }
  }

  async getRecentDisparos(baseId: string, limit: number = 10): Promise<any[]> {
    try {
      const clientId = this.getClientId();
      
      console.log('📨 Buscando TODOS os disparos recentes para cliente:', clientId);
      console.log('🎯 Usando tabela específica ID:', this.DISPARO_EM_MASSA_TABLE_ID);

      // Buscar TODOS os disparos com cache-busting e ordenação
      const timestamp = Date.now();
      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.DISPARO_EM_MASSA_TABLE_ID}?limit=${limit}&sort=-Id&_t=${timestamp}`;
      console.log('📡 URL de busca:', url);
      
      const response = await fetch(url, {
        headers: {
          ...this.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (response.ok) {
        const data = await response.json();
        const allDisparos = data.list || [];
        
        console.log(`📊 ${allDisparos.length} disparos totais encontrados na tabela`);
        console.log('📋 Campos disponíveis no primeiro registro:', Object.keys(allDisparos[0] || {}));
        console.log('📝 Primeiros 2 registros para debug:', allDisparos.slice(0, 2));
        
        // Filtro mais flexível para client_id
        const clientDisparos = allDisparos.filter(d => {
          if (!d.client_id && !d.Client_id && !d.clientId) {
            return true; // Incluir disparos sem client_id
          }
          const hasClientId = d.client_id === clientId || 
                             d.Client_id === clientId || 
                             d.clientId === clientId;
          return hasClientId;
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
