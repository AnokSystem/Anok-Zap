
import { Disparo } from './types';

export const mapStatus = (status: string): 'enviado' | 'pendente' | 'erro' | 'enviando' | 'concluido' | 'cancelado' => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'concluido':
    case 'finalizado':
    case 'completed':
    case 'complete':
      return 'concluido';
    case 'iniciado':
    case 'enviando':
    case 'sending':
    case 'em_andamento':
      return 'enviando';
    case 'erro':
    case 'falha':
    case 'error':
    case 'failed':
      return 'erro';
    case 'cancelado':
    case 'cancelled':
    case 'canceled':
      return 'cancelado';
    case 'enviado':
    case 'sent':
      return 'enviado';
    default:
      return 'pendente';
  }
};

export const calculateContactsReached = (status: string, sentCount: number, recipientCount: number, contactsReachedFromDB?: number): number => {
  // Se temos o valor direto do banco de dados, usar ele
  if (contactsReachedFromDB !== undefined && contactsReachedFromDB !== null) {
    return contactsReachedFromDB;
  }

  // Fallback para cálculo baseado no status
  if (status === 'concluido') {
    return recipientCount;
  } else if (status === 'enviando' || status === 'enviado') {
    return Math.min(sentCount, recipientCount);
  } else if (status === 'erro' || status === 'cancelado') {
    return Math.min(sentCount, recipientCount);
  }
  return 0;
};

export const transformDisparoData = (item: any): Disparo => {
  console.log('🔍 Processando item completo:', item);
  
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
  
  const errorCount = Number(item.Erros || 
                           item.error_count || 
                           item.Error_count ||
                           item.ErrorCount ||
                           item.erros ||
                           0);

  // Mapear campo de contatos alcançados do NocoDB
  const contactsReachedFromDB = Number(item['Contatos Alcançados'] || 
                                      item['Contatos_Alcancados'] ||
                                      item.contatos_alcancados ||
                                      item.contacts_reached ||
                                      item.Contacts_reached ||
                                      item.ContactsReached ||
                                      item.contatos_reached ||
                                      null);

  const status = mapStatus(item.Status || item.status || 'pendente');
  const contactsReached = calculateContactsReached(
    status, 
    sentCount, 
    recipientCount, 
    isNaN(contactsReachedFromDB) ? undefined : contactsReachedFromDB
  );
  
  console.log('✅ Contatos alcançados calculado:', {
    contactsReachedFromDB,
    contactsReached,
    status,
    sentCount,
    recipientCount
  });
  
  return {
    id: String(item.ID || item.Id || item.id || Math.random()),
    campaignName,
    instanceName,
    recipientCount,
    sentCount,
    errorCount,
    contactsReached,
    status,
    createdAt: item['Hora de Início'] ||
              item['Criado em'] ||
              item.start_time || 
              item.Start_time ||
              item.CreatedAt || 
              item.created_at || 
              item.Created_at ||
              item.data_criacao ||
              new Date().toISOString(),
    messageType: item['Tipo de Mensagem'] || item.message_type || item.Message_type || item.tipo_mensagem || 'text'
  };
};
