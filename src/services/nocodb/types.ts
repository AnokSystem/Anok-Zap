
export interface NocodbConfig {
  baseUrl: string;
  apiToken: string;
}

export interface DiscoveredBase {
  id: string;
  title: string;
  description?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  error?: string;
  bases?: DiscoveredBase[];
  targetBase?: string;
}

export interface TableColumn {
  column_name: string;
  title: string;
  uidt: string; // UI Data Type
  dt?: string; // Data Type
  np?: string; // Numeric Precision
  ns?: string; // Numeric Scale
  clen?: string; // Column Length
  pk?: boolean; // Primary Key
  ai?: boolean; // Auto Increment
  rqd?: boolean; // Required
  un?: boolean; // Unsigned
  ct?: string; // Column Type
  dtx?: string; // Data Type Extra
  dtxp?: string; // Data Type Extra Parameters
  dtxs?: string; // Data Type Extra Scale
}

export interface TableSchema {
  table_name: string;
  title: string;
  columns: TableColumn[];
}

// Esquemas das tabelas com identificação por cliente
export const TABLE_SCHEMAS: Record<string, TableSchema> = {
  NotificacoesHotmart: {
    table_name: 'NotificacoesHotmart',
    title: 'Notificações Hotmart',
    columns: [
      { column_name: 'id', title: 'ID', uidt: 'ID', pk: true, ai: true, rqd: true },
      { column_name: 'client_id', title: 'ID do Cliente', uidt: 'SingleLineText', rqd: true },
      { column_name: 'user_id', title: 'ID do Usuário', uidt: 'SingleLineText' },
      { column_name: 'hottok', title: 'Hottok', uidt: 'SingleLineText' },
      { column_name: 'event_type', title: 'Tipo de Evento', uidt: 'SingleLineText' },
      { column_name: 'event_date', title: 'Data do Evento', uidt: 'DateTime' },
      { column_name: 'product_id', title: 'ID do Produto', uidt: 'SingleLineText' },
      { column_name: 'product_name', title: 'Nome do Produto', uidt: 'LongText' },
      { column_name: 'product_ucode', title: 'Código do Produto', uidt: 'SingleLineText' },
      { column_name: 'affiliate_code', title: 'Código do Afiliado', uidt: 'SingleLineText' },
      { column_name: 'producer_name', title: 'Nome do Produtor', uidt: 'SingleLineText' },
      { column_name: 'buyer_name', title: 'Nome do Comprador', uidt: 'SingleLineText' },
      { column_name: 'buyer_email', title: 'Email do Comprador', uidt: 'Email' },
      { column_name: 'buyer_phone', title: 'Telefone do Comprador', uidt: 'PhoneNumber' },
      { column_name: 'buyer_document', title: 'Documento do Comprador', uidt: 'SingleLineText' },
      { column_name: 'purchase_date', title: 'Data da Compra', uidt: 'DateTime' },
      { column_name: 'purchase_value', title: 'Valor da Compra', uidt: 'Currency' },
      { column_name: 'commission_value', title: 'Valor da Comissão', uidt: 'Currency' },
      { column_name: 'currency_code', title: 'Código da Moeda', uidt: 'SingleLineText' },
      { column_name: 'subscription_id', title: 'ID da Assinatura', uidt: 'SingleLineText' },
      { column_name: 'recurrency_number', title: 'Número da Recorrência', uidt: 'Number' },
      { column_name: 'platform', title: 'Plataforma', uidt: 'SingleSelect' },
      { column_name: 'status', title: 'Status', uidt: 'SingleSelect' },
      { column_name: 'webhook_data', title: 'Dados do Webhook', uidt: 'LongText' },
      { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime', rqd: true },
      { column_name: 'updated_at', title: 'Atualizado em', uidt: 'DateTime' }
    ]
  },

  MassMessagingLogs: {
    table_name: 'MassMessagingLogs',
    title: 'Logs de Disparo em Massa',
    columns: [
      { column_name: 'id', title: 'ID', uidt: 'ID', pk: true, ai: true, rqd: true },
      { column_name: 'client_id', title: 'ID do Cliente', uidt: 'SingleLineText', rqd: true },
      { column_name: 'campaign_id', title: 'ID da Campanha', uidt: 'SingleLineText', rqd: true },
      { column_name: 'campaign_name', title: 'Nome da Campanha', uidt: 'SingleLineText' },
      { column_name: 'instance_id', title: 'ID da Instância', uidt: 'SingleLineText' },
      { column_name: 'instance_name', title: 'Nome da Instância', uidt: 'SingleLineText' },
      { column_name: 'message_type', title: 'Tipo de Mensagem', uidt: 'SingleSelect' },
      { column_name: 'recipient_count', title: 'Quantidade de Destinatários', uidt: 'Number' },
      { column_name: 'sent_count', title: 'Quantidade Enviada', uidt: 'Number' },
      { column_name: 'error_count', title: 'Quantidade de Erros', uidt: 'Number' },
      { column_name: 'delay', title: 'Delay (ms)', uidt: 'Number' },
      { column_name: 'status', title: 'Status', uidt: 'SingleSelect' },
      { column_name: 'start_time', title: 'Hora de Início', uidt: 'DateTime' },
      { column_name: 'end_time', title: 'Hora de Fim', uidt: 'DateTime' },
      { column_name: 'notification_phone', title: 'Telefone de Notificação', uidt: 'PhoneNumber' },
      { column_name: 'data_json', title: 'Dados JSON', uidt: 'LongText' },
      { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime', rqd: true },
      { column_name: 'updated_at', title: 'Atualizado em', uidt: 'DateTime' }
    ]
  },

  WhatsAppContacts: {
    table_name: 'WhatsAppContacts',
    title: 'Contatos WhatsApp',
    columns: [
      { column_name: 'id', title: 'ID', uidt: 'ID', pk: true, ai: true, rqd: true },
      { column_name: 'client_id', title: 'ID do Cliente', uidt: 'SingleLineText', rqd: true },
      { column_name: 'contact_id', title: 'ID do Contato', uidt: 'SingleLineText' },
      { column_name: 'name', title: 'Nome', uidt: 'SingleLineText' },
      { column_name: 'phone_number', title: 'Número de Telefone', uidt: 'PhoneNumber', rqd: true },
      { column_name: 'group_name', title: 'Nome do Grupo', uidt: 'SingleLineText' },
      { column_name: 'instance_id', title: 'ID da Instância', uidt: 'SingleLineText' },
      { column_name: 'is_business', title: 'É Empresa', uidt: 'Checkbox' },
      { column_name: 'profile_picture_url', title: 'URL da Foto de Perfil', uidt: 'URL' },
      { column_name: 'last_seen', title: 'Visto por Último', uidt: 'DateTime' },
      { column_name: 'data_json', title: 'Dados JSON', uidt: 'LongText' },
      { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime', rqd: true },
      { column_name: 'updated_at', title: 'Atualizado em', uidt: 'DateTime' }
    ]
  },

  WhatsAppInstances: {
    table_name: 'WhatsAppInstances',
    title: 'Instâncias WhatsApp',
    columns: [
      { column_name: 'id', title: 'ID', uidt: 'ID', pk: true, ai: true, rqd: true },
      { column_name: 'client_id', title: 'ID do Cliente', uidt: 'SingleLineText', rqd: true },
      { column_name: 'instance_id', title: 'ID da Instância', uidt: 'SingleLineText', rqd: true },
      { column_name: 'name', title: 'Nome', uidt: 'SingleLineText' },
      { column_name: 'status', title: 'Status', uidt: 'SingleSelect' },
      { column_name: 'phone_number', title: 'Número de Telefone', uidt: 'PhoneNumber' },
      { column_name: 'profile_name', title: 'Nome do Perfil', uidt: 'SingleLineText' },
      { column_name: 'profile_picture_url', title: 'URL da Foto de Perfil', uidt: 'URL' },
      { column_name: 'webhook_url', title: 'URL do Webhook', uidt: 'URL' },
      { column_name: 'api_key', title: 'Chave da API', uidt: 'SingleLineText' },
      { column_name: 'data_json', title: 'Dados JSON', uidt: 'LongText' },
      { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime', rqd: true },
      { column_name: 'updated_at', title: 'Atualizado em', uidt: 'DateTime' }
    ]
  },

  DashboardStats: {
    table_name: 'DashboardStats',
    title: 'Estatísticas Dashboard',
    columns: [
      { column_name: 'id', title: 'ID', uidt: 'ID', pk: true, ai: true, rqd: true },
      { column_name: 'client_id', title: 'ID do Cliente', uidt: 'SingleLineText', rqd: true },
      { column_name: 'date', title: 'Data', uidt: 'Date', rqd: true },
      { column_name: 'total_disparos', title: 'Total de Disparos', uidt: 'Number' },
      { column_name: 'total_notifications', title: 'Total de Notificações', uidt: 'Number' },
      { column_name: 'success_rate', title: 'Taxa de Sucesso (%)', uidt: 'Decimal' },
      { column_name: 'unique_contacts', title: 'Contatos Únicos', uidt: 'Number' },
      { column_name: 'disparos_today', title: 'Disparos Hoje', uidt: 'Number' },
      { column_name: 'notifications_today', title: 'Notificações Hoje', uidt: 'Number' },
      { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime', rqd: true },
      { column_name: 'updated_at', title: 'Atualizado em', uidt: 'DateTime' }
    ]
  },

  Usuarios: {
    table_name: 'Usuarios',
    title: 'Usuários',
    columns: [
      { column_name: 'id', title: 'ID', uidt: 'ID', pk: true, ai: true, rqd: true },
      { column_name: 'client_id', title: 'ID do Cliente', uidt: 'SingleLineText', rqd: true },
      { column_name: 'nome', title: 'Nome', uidt: 'SingleLineText', rqd: true },
      { column_name: 'email', title: 'Email', uidt: 'Email', rqd: true },
      { column_name: 'senha', title: 'Senha', uidt: 'SingleLineText' },
      { column_name: 'role', title: 'Função', uidt: 'SingleSelect' },
      { column_name: 'ativo', title: 'Ativo', uidt: 'Checkbox' },
      { column_name: 'ultimo_acesso', title: 'Último Acesso', uidt: 'DateTime' },
      { column_name: 'configuracoes', title: 'Configurações', uidt: 'LongText' },
      { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime', rqd: true },
      { column_name: 'updated_at', title: 'Atualizado em', uidt: 'DateTime' }
    ]
  }
};
