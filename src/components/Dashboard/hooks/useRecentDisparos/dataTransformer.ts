
import { Disparo } from './types';
import { mapStatus } from './statusMapper';

export const transformDisparosData = (data: any[]): Disparo[] => {
  return data.map((item: any) => {
    console.log('🔍 Processando item completo:', item);
    
    // Mapear usando os nomes exatos dos campos conforme console logs
    const campaignName = item['Nome da Campanha'] || 
                       item.campaign_name || 
                       item.Campaign_name || 
                       item.CampaignName || 
                       item.nome_campanha ||
                       item.campanha ||
                       `Campanha ${item.ID || item.Id || item.id || 'N/A'}`;
    
    const instanceName = item['Nome da Instância'] || 
                        item['ID da Instância'] ||
                        item.instance_name || 
                        item.Instance_name || 
                        item.InstanceName ||
                        item.instance_id || 
                        item.Instance_id ||
                        item.instanceId ||
                        item.instancia ||
                        'Instância não identificada';
    
    const recipientCount = Number(item['Total de Destinatários'] || 
                                 item.recipient_count || 
                                 item.Recipient_count ||
                                 item.RecipientCount ||
                                 item.total_recipients ||
                                 item.destinatarios ||
                                 0);
    
    const sentCount = Number(item['Mensagens Enviadas'] || 
                            item.sent_count || 
                            item.Sent_count ||
                            item.SentCount ||
                            item.enviados ||
                            0);
    
    const status = mapStatus(item.Status || item.status || 'pendente');
    
    const createdAt = item['Hora de Início'] ||
                     item['Criado em'] ||
                     item.start_time || 
                     item.Start_time ||
                     item.CreatedAt || 
                     item.created_at || 
                     item.Created_at ||
                     item.data_criacao ||
                     new Date().toISOString();
    
    console.log('✅ Dados mapeados:', {
      campaignName,
      instanceName,
      recipientCount,
      sentCount,
      status,
      createdAt
    });
    
    return {
      id: String(item.ID || item.Id || item.id || Math.random()),
      campaignName,
      instanceName,
      recipientCount,
      sentCount,
      status,
      createdAt,
      messageType: item['Tipo de Mensagem'] || item.message_type || item.Message_type || item.tipo_mensagem || 'text'
    };
  });
};
