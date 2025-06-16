
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';

export class DisparosSampleDataService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  private async getClientId(): Promise<string> {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.client_id || user.Email?.split('@')[0] || 'default';
  }

  async createSampleData(baseId: string, tableId: string): Promise<boolean> {
    try {
      const clientId = await this.getClientId();
      
      if (!tableId) {
        console.error('❌ Tabela não disponível para criar dados de exemplo');
        return false;
      }

      console.log('📝 Criando dados de exemplo para disparos...');

      const sampleData = [
        {
          campaign_name: 'Campanha de Boas-vindas',
          instance_name: 'Instance Principal',
          instance_id: 'inst_001',
          recipient_count: 150,
          sent_count: 148,
          error_count: 2,
          status: 'Concluído',
          message_type: 'text',
          start_time: new Date().toISOString(),
          client_id: clientId
        },
        {
          campaign_name: 'Promoção Black Friday',
          instance_name: 'Instance Secundária',
          instance_id: 'inst_002',
          recipient_count: 300,
          sent_count: 285,
          error_count: 15,
          status: 'Concluído',
          message_type: 'media',
          start_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          client_id: clientId
        }
      ];

      for (const data of sampleData) {
        await fetch(
          `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`,
          {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(data)
          }
        );
      }

      console.log('✅ Dados de exemplo criados para disparos');
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar dados de exemplo:', error);
      return false;
    }
  }
}
