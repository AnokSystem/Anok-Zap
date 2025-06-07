
export interface NocodbConfig {
  baseUrl: string;
  apiToken: string;
}

export interface TableSchema {
  table_name: string;
  title: string;
  columns: TableColumn[];
}

export interface TableColumn {
  column_name: string;
  title: string;
  uidt: string;
}

export interface DiscoveredBase {
  id: string;
  title: string;
}

export interface ConnectionTestResult {
  success: boolean;
  bases?: DiscoveredBase[];
  targetBase?: string;
  error?: string;
}

export interface SaveResult {
  success: boolean;
  error?: string;
}

export const TABLE_SCHEMAS: Record<string, TableSchema> = {
  NotificacoesHotmart: {
    table_name: 'NotificacoesHotmart',
    title: 'Notificações Hotmart',
    columns: [
      { column_name: 'id', title: 'ID', uidt: 'ID' },
      { column_name: 'event_type', title: 'Tipo de Evento', uidt: 'SingleLineText' },
      { column_name: 'instance_id', title: 'ID da Instância', uidt: 'SingleLineText' },
      { column_name: 'user_role', title: 'Função do Usuário', uidt: 'SingleLineText' },
      { column_name: 'hotmart_profile', title: 'Perfil Hotmart', uidt: 'SingleLineText' },
      { column_name: 'webhook_url', title: 'URL do Webhook', uidt: 'LongText' },
      { column_name: 'message_count', title: 'Quantidade de Mensagens', uidt: 'Number' },
      { column_name: 'notification_phone', title: 'Telefone de Notificação', uidt: 'SingleLineText' },
      { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime' },
      { column_name: 'data_json', title: 'Dados Completos (JSON)', uidt: 'LongText' }
    ]
  },
  WhatsAppInstances: {
    table_name: 'WhatsAppInstances',
    title: 'Instâncias WhatsApp',
    columns: [
      { column_name: 'id', title: 'ID', uidt: 'ID' },
      { column_name: 'instance_id', title: 'ID da Instância', uidt: 'SingleLineText' },
      { column_name: 'name', title: 'Nome', uidt: 'SingleLineText' },
      { column_name: 'status', title: 'Status', uidt: 'SingleLineText' },
      { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime' },
      { column_name: 'last_updated', title: 'Última Atualização', uidt: 'DateTime' },
      { column_name: 'data_json', title: 'Dados Completos (JSON)', uidt: 'LongText' }
    ]
  },
  WhatsAppContacts: {
    table_name: 'WhatsAppContacts',
    title: 'Contatos WhatsApp',
    columns: [
      { column_name: 'id', title: 'ID', uidt: 'ID' },
      { column_name: 'contact_id', title: 'ID do Contato', uidt: 'SingleLineText' },
      { column_name: 'name', title: 'Nome', uidt: 'SingleLineText' },
      { column_name: 'phone_number', title: 'Número do Telefone', uidt: 'SingleLineText' },
      { column_name: 'group_name', title: 'Nome do Grupo', uidt: 'SingleLineText' },
      { column_name: 'instance_id', title: 'ID da Instância', uidt: 'SingleLineText' },
      { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime' },
      { column_name: 'data_json', title: 'Dados Completos (JSON)', uidt: 'LongText' }
    ]
  },
  MassMessagingLogs: {
    table_name: 'MassMessagingLogs',
    title: 'Logs de Disparo em Massa',
    columns: [
      { column_name: 'id', title: 'ID', uidt: 'ID' },
      { column_name: 'campaign_id', title: 'ID da Campanha', uidt: 'SingleLineText' },
      { column_name: 'instance_id', title: 'ID da Instância', uidt: 'SingleLineText' },
      { column_name: 'message_type', title: 'Tipo de Mensagem', uidt: 'SingleLineText' },
      { column_name: 'recipient_count', title: 'Quantidade de Destinatários', uidt: 'Number' },
      { column_name: 'delay', title: 'Delay (ms)', uidt: 'Number' },
      { column_name: 'status', title: 'Status', uidt: 'SingleLineText' },
      { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime' },
      { column_name: 'data_json', title: 'Dados Completos (JSON)', uidt: 'LongText' }
    ]
  },
  WebhookLogs: {
    table_name: 'WebhookLogs',
    title: 'Logs de Webhooks',
    columns: [
      { column_name: 'id', title: 'ID', uidt: 'ID' },
      { column_name: 'webhook_url', title: 'URL do Webhook', uidt: 'LongText' },
      { column_name: 'event_type', title: 'Tipo de Evento', uidt: 'SingleLineText' },
      { column_name: 'source', title: 'Origem', uidt: 'SingleLineText' },
      { column_name: 'status_code', title: 'Código de Status', uidt: 'Number' },
      { column_name: 'response_time', title: 'Tempo de Resposta (ms)', uidt: 'Number' },
      { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime' },
      { column_name: 'request_data', title: 'Dados da Requisição (JSON)', uidt: 'LongText' },
      { column_name: 'response_data', title: 'Dados da Resposta (JSON)', uidt: 'LongText' }
    ]
  }
};
