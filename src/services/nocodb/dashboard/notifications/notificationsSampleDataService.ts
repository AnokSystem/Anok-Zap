
import { BaseNotificationsService } from './baseNotificationsService';

export class NotificationsSampleDataService extends BaseNotificationsService {
  async createSampleData(baseId: string): Promise<boolean> {
    try {
      const tableId = await this.getNotificationsTableId(baseId);
      const { userId } = this.getUserInfo();
      
      if (!tableId) {
        console.error('❌ Tabela não disponível para criar dados de exemplo');
        return false;
      }

      console.log('📝 Criando dados de exemplo para notificações na tabela mzup2t8ygoiy5ub...');
      console.log('👤 Usando client_id:', userId);

      const sampleData = this.generateSampleNotifications(userId);

      console.log('📤 Enviando dados de teste:', sampleData);

      for (const data of sampleData) {
        try {
          const response = await fetch(
            `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`,
            {
              method: 'POST',
              headers: this.headers,
              body: JSON.stringify(data)
            }
          );

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Notificação de exemplo criada:', result);
          } else {
            const errorText = await response.text();
            console.error('❌ Erro ao criar notificação:', errorText);
          }
        } catch (error) {
          console.error('❌ Erro na requisição:', error);
        }
      }

      console.log('✅ Processo de criação de dados de exemplo concluído');
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar dados de exemplo:', error);
      return false;
    }
  }

  private generateSampleNotifications(userId: string) {
    const now = new Date();
    
    return [
      {
        'Cliente ID': userId,
        platform: 'hotmart',
        event_type: 'purchase',
        transaction_id: `TXN_${Date.now()}_001`,
        product_id: 'PROD_001',
        product_name: 'Curso de Marketing Digital',
        customer_name: 'João Silva Teste',
        customer_email: 'joao.teste@email.com',
        customer_phone: '+5511999888777',
        value: 197.50,
        currency: 'BRL',
        commission_value: 39.50,
        status: 'approved',
        event_date: now.toISOString(),
        processed: false,
        webhook_data: JSON.stringify({
          source: 'test_data',
          created_at: now.toISOString()
        }),
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      },
      {
        'Cliente ID': userId,
        platform: 'eduzz',
        event_type: 'subscription',
        transaction_id: `TXN_${Date.now()}_002`,
        product_id: 'PROD_002',
        product_name: 'Assinatura Premium Teste',
        customer_name: 'Maria Santos Teste',
        customer_email: 'maria.teste@email.com',
        customer_phone: '+5511888777666',
        value: 29.90,
        currency: 'BRL',
        commission_value: 8.97,
        status: 'approved',
        event_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        processed: false,
        webhook_data: JSON.stringify({
          source: 'test_data',
          created_at: now.toISOString()
        }),
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        'Cliente ID': userId,
        platform: 'monetizze',
        event_type: 'purchase',
        transaction_id: `TXN_${Date.now()}_003`,
        product_id: 'PROD_003',
        product_name: 'E-book Vendas Online',
        customer_name: 'Carlos Oliveira Teste',
        customer_email: 'carlos.teste@email.com',
        customer_phone: '+5511777666555',
        value: 47.00,
        currency: 'BRL',
        commission_value: 14.10,
        status: 'approved',
        event_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        processed: false,
        webhook_data: JSON.stringify({
          source: 'test_data',
          created_at: now.toISOString()
        }),
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}
