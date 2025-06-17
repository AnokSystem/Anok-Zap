
import { NocodbConfig } from '../types';

export class ContactsReachedService {
  private config: NocodbConfig;
  private headers: Record<string, string>;
  private DISPARO_EM_MASSA_TABLE_ID = 'myx4lsmm5i02xcd';

  constructor(config: NocodbConfig) {
    this.config = config;
    this.headers = {
      'Content-Type': 'application/json',
      'xc-token': config.apiToken,
    };
  }

  async initializeCampaign(baseId: string, campaignId: string, totalContacts: number): Promise<boolean> {
    try {
      console.log(`🚀 Inicializando campanha ${campaignId} com ${totalContacts} contatos`);
      
      const updateData = {
        contacts_reached: 0,
        status: 'enviando',
        updated_at: new Date().toISOString()
      };
      
      return await this.updateCampaignProgress(baseId, campaignId, updateData);
    } catch (error) {
      console.error('❌ Erro ao inicializar campanha:', error);
      return false;
    }
  }

  async incrementContactsReached(baseId: string, campaignId: string): Promise<boolean> {
    try {
      console.log(`📈 Incrementando contatos alcançados para campanha ${campaignId}`);
      
      // Buscar dados atuais da campanha
      const currentData = await this.getCampaignData(baseId, campaignId);
      if (!currentData) {
        console.error('❌ Campanha não encontrada para incremento');
        return false;
      }
      
      const currentContactsReached = Number(currentData.contacts_reached || 0);
      const totalContacts = Number(currentData.recipient_count || 0);
      const newContactsReached = currentContactsReached + 1;
      
      // Determinar status baseado no progresso
      let status = 'enviando';
      if (newContactsReached >= totalContacts) {
        status = 'concluido';
      }
      
      const updateData = {
        contacts_reached: newContactsReached,
        status: status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'concluido') {
        updateData['end_time'] = new Date().toISOString();
      }
      
      console.log(`📊 Progresso: ${newContactsReached}/${totalContacts} (${status})`);
      
      return await this.updateCampaignProgress(baseId, campaignId, updateData);
    } catch (error) {
      console.error('❌ Erro ao incrementar contatos alcançados:', error);
      return false;
    }
  }

  async finalizeCampaign(baseId: string, campaignId: string, finalStatus: string = 'concluido'): Promise<boolean> {
    try {
      console.log(`🏁 Finalizando campanha ${campaignId} com status ${finalStatus}`);
      
      const currentData = await this.getCampaignData(baseId, campaignId);
      if (!currentData) {
        console.error('❌ Campanha não encontrada para finalização');
        return false;
      }
      
      const totalContacts = Number(currentData.recipient_count || 0);
      
      const updateData = {
        contacts_reached: finalStatus === 'concluido' ? totalContacts : currentData.contacts_reached,
        status: finalStatus,
        end_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return await this.updateCampaignProgress(baseId, campaignId, updateData);
    } catch (error) {
      console.error('❌ Erro ao finalizar campanha:', error);
      return false;
    }
  }

  private async getCampaignData(baseId: string, campaignId: string): Promise<any | null> {
    try {
      const searchUrl = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.DISPARO_EM_MASSA_TABLE_ID}?where=(campaign_id,eq,${campaignId})`;
      
      const response = await fetch(searchUrl, {
        headers: this.headers,
      });

      if (response.ok) {
        const data = await response.json();
        const records = data.list || [];
        return records.length > 0 ? records[0] : null;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar dados da campanha:', error);
      return null;
    }
  }

  private async updateCampaignProgress(baseId: string, campaignId: string, updateData: any): Promise<boolean> {
    try {
      // Buscar o registro da campanha
      const campaignData = await this.getCampaignData(baseId, campaignId);
      if (!campaignData) {
        console.error('❌ Campanha não encontrada para atualização');
        return false;
      }
      
      const recordId = campaignData.Id || campaignData.ID || campaignData.id;
      
      const updateUrl = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.DISPARO_EM_MASSA_TABLE_ID}/${recordId}`;
      
      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        console.log('✅ Progresso da campanha atualizado com sucesso');
        
        // Disparar evento de atualização do dashboard
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('dashboardRefresh'));
        }, 500);
        
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao atualizar progresso da campanha:', errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro geral ao atualizar progresso:', error);
      return false;
    }
  }
}
