export interface NocodbConfig {
  baseUrl: string;
  apiToken: string;
}

export interface DiscoveredBase {
  id: string;
  name: string;
  title: string;
}

export interface ConnectionTestResult {
  success: boolean;
  bases?: DiscoveredBase[];
  targetBase?: string | null;
  tablesVerified?: boolean;
  error?: string;
}

export interface TableSchema {
  table_name: string;
  title: string;
  columns: ColumnSchema[];
}

export interface ColumnSchema {
  column_name: string;
  title: string;
  uidt: string;
  pk?: boolean;
  ai?: boolean;
  rqd?: boolean;
  default?: string | number | boolean;
  dtxp?: string;
}

export const TABLE_SCHEMAS = {
  // Tabela para registrar disparos automáticos
  MassMessagingLogs: {
    table_name: 'mass_messaging_logs',
    title: 'Disparos em Massa',
    columns: [
      {
        column_name: 'id',
        title: 'ID',
        uidt: 'ID',
        pk: true,
        ai: true,
        rqd: true
      },
      {
        column_name: 'client_id',
        title: 'Cliente ID',
        uidt: 'SingleLineText',
        rqd: true
      },
      {
        column_name: 'campaign_id',
        title: 'ID da Campanha',
        uidt: 'SingleLineText',
        rqd: true
      },
      {
        column_name: 'campaign_name',
        title: 'Nome da Campanha',
        uidt: 'SingleLineText',
        rqd: true
      },
      {
        column_name: 'instance_id',
        title: 'ID da Instância',
        uidt: 'SingleLineText',
        rqd: true
      },
      {
        column_name: 'instance_name',
        title: 'Nome da Instância',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'message_type',
        title: 'Tipo de Mensagem',
        uidt: 'SingleSelect',
        dtxp: "'text','image','audio','video','document'"
      },
      {
        column_name: 'recipient_count',
        title: 'Total de Destinatários',
        uidt: 'Number',
        rqd: true
      },
      {
        column_name: 'sent_count',
        title: 'Mensagens Enviadas',
        uidt: 'Number',
        default: 0
      },
      {
        column_name: 'error_count',
        title: 'Erros',
        uidt: 'Number',
        default: 0
      },
      {
        column_name: 'delay',
        title: 'Delay (ms)',
        uidt: 'Number'
      },
      {
        column_name: 'status',
        title: 'Status',
        uidt: 'SingleSelect',
        dtxp: "'iniciado','enviando','concluido','erro','cancelado'"
      },
      {
        column_name: 'start_time',
        title: 'Hora de Início',
        uidt: 'DateTime'
      },
      {
        column_name: 'end_time',
        title: 'Hora de Fim',
        uidt: 'DateTime'
      },
      {
        column_name: 'notification_phone',
        title: 'Telefone de Notificação',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'data_json',
        title: 'Dados JSON',
        uidt: 'LongText'
      },
      {
        column_name: 'created_at',
        title: 'Criado em',
        uidt: 'DateTime',
        default: 'now()'
      },
      {
        column_name: 'updated_at',
        title: 'Atualizado em',
        uidt: 'DateTime',
        default: 'now()'
      }
    ]
  },

  // Tabela para notificações das plataformas (atualizada pelo n8n)
  NotificacoesPlataformas: {
    table_name: 'notificacoes_plataformas',
    title: 'Notificações das Plataformas',
    columns: [
      {
        column_name: 'id',
        title: 'ID',
        uidt: 'ID',
        pk: true,
        ai: true,
        rqd: true
      },
      {
        column_name: 'client_id',
        title: 'Cliente ID',
        uidt: 'SingleLineText',
        rqd: true
      },
      {
        column_name: 'platform',
        title: 'Plataforma',
        uidt: 'SingleSelect',
        dtxp: "'hotmart','eduzz','monetizze','guru','kiwify','perfectpay'"
      },
      {
        column_name: 'event_type',
        title: 'Tipo de Evento',
        uidt: 'SingleSelect',
        dtxp: "'purchase','subscription','cancel','refund','chargeback','approval'"
      },
      {
        column_name: 'transaction_id',
        title: 'ID da Transação',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'product_id',
        title: 'ID do Produto',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'product_name',
        title: 'Nome do Produto',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'customer_name',
        title: 'Nome do Cliente',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'customer_email',
        title: 'Email do Cliente',
        uidt: 'Email'
      },
      {
        column_name: 'customer_phone',
        title: 'Telefone do Cliente',
        uidt: 'PhoneNumber'
      },
      {
        column_name: 'value',
        title: 'Valor',
        uidt: 'Currency'
      },
      {
        column_name: 'currency',
        title: 'Moeda',
        uidt: 'SingleLineText',
        default: 'BRL'
      },
      {
        column_name: 'commission_value',
        title: 'Valor da Comissão',
        uidt: 'Currency'
      },
      {
        column_name: 'status',
        title: 'Status',
        uidt: 'SingleSelect',
        dtxp: "'approved','pending','cancelled','refunded'"
      },
      {
        column_name: 'event_date',
        title: 'Data do Evento',
        uidt: 'DateTime'
      },
      {
        column_name: 'processed',
        title: 'Processado',
        uidt: 'Checkbox',
        default: false
      },
      {
        column_name: 'webhook_data',
        title: 'Dados do Webhook',
        uidt: 'LongText'
      },
      {
        column_name: 'created_at',
        title: 'Criado em',
        uidt: 'DateTime',
        default: 'now()'
      },
      {
        column_name: 'updated_at',
        title: 'Atualizado em',
        uidt: 'DateTime',
        default: 'now()'
      }
    ]
  },
  NotificacoesHotmart: {
    table_name: 'notificacoes_hotmart',
    title: 'Notificações Hotmart',
    columns: [
      {
        column_name: 'id',
        title: 'ID',
        uidt: 'ID',
        pk: true,
        ai: true,
        rqd: true
      },
      {
        column_name: 'event',
        title: 'Evento',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'event_date',
        title: 'Data do Evento',
        uidt: 'DateTime'
      },
      {
        column_name: 'product_id',
        title: 'ID do Produto',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'product_name',
        title: 'Nome do Produto',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'producer_id',
        title: 'ID do Produtor',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'producer_name',
        title: 'Nome do Produtor',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'transaction',
        title: 'Transação',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'offer',
        title: 'Oferta',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'price',
        title: 'Preço',
        uidt: 'Number'
      },
      {
        column_name: 'currency',
        title: 'Moeda',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'payment_type',
        title: 'Tipo de Pagamento',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'payment_status',
        title: 'Status do Pagamento',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'customer_name',
        title: 'Nome do Comprador',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'customer_email',
        title: 'Email do Comprador',
        uidt: 'Email'
      },
      {
        column_name: 'customer_phone',
        title: 'Telefone do Comprador',
        uidt: 'PhoneNumber'
      },
      {
        column_name: 'status',
        title: 'Status',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'hotmart_data',
        title: 'Dados Hotmart',
        uidt: 'LongText'
      },
      {
        column_name: 'created_at',
        title: 'Criado em',
        uidt: 'DateTime',
        default: 'now()'
      },
      {
        column_name: 'updated_at',
        title: 'Atualizado em',
        uidt: 'DateTime',
        default: 'now()'
      }
    ]
  },
  WhatsAppContacts: {
    table_name: 'whatsapp_contacts',
    title: 'Contatos WhatsApp',
    columns: [
      {
        column_name: 'id',
        title: 'ID',
        uidt: 'ID',
        pk: true,
        ai: true,
        rqd: true
      },
      {
        column_name: 'client_id',
        title: 'Cliente ID',
        uidt: 'SingleLineText',
        rqd: true
      },
      {
        column_name: 'contact_id',
        title: 'ID do Contato',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'name',
        title: 'Nome',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'phone_number',
        title: 'Número de Telefone',
        uidt: 'PhoneNumber',
        rqd: true
      },
      {
        column_name: 'group_name',
        title: 'Nome do Grupo',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'instance_id',
        title: 'ID da Instância',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'is_business',
        title: 'É Empresa',
        uidt: 'Checkbox'
      },
      {
        column_name: 'profile_picture_url',
        title: 'URL da Foto de Perfil',
        uidt: 'URL'
      },
      {
        column_name: 'last_seen',
        title: 'Visto por Último',
        uidt: 'DateTime'
      },
      {
        column_name: 'data_json',
        title: 'Dados JSON',
        uidt: 'LongText'
      },
      {
        column_name: 'created_at',
        title: 'Criado em',
        uidt: 'DateTime',
        default: 'now()'
      },
      {
        column_name: 'updated_at',
        title: 'Atualizado em',
        uidt: 'DateTime',
        default: 'now()'
      }
    ]
  },
  WhatsAppInstances: {
    table_name: 'whatsapp_instances',
    title: 'Instâncias WhatsApp',
    columns: [
      {
        column_name: 'id',
        title: 'ID',
        uidt: 'ID',
        pk: true,
        ai: true,
        rqd: true
      },
      {
        column_name: 'client_id',
        title: 'Cliente ID',
        uidt: 'SingleLineText',
        rqd: true
      },
      {
        column_name: 'instance_id',
        title: 'ID da Instância',
        uidt: 'SingleLineText',
        rqd: true
      },
      {
        column_name: 'name',
        title: 'Nome',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'status',
        title: 'Status',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'phone_number',
        title: 'Número de Telefone',
        uidt: 'PhoneNumber'
      },
      {
        column_name: 'profile_name',
        title: 'Nome do Perfil',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'profile_picture_url',
        title: 'URL da Foto de Perfil',
        uidt: 'URL'
      },
      {
        column_name: 'webhook_url',
        title: 'URL do Webhook',
        uidt: 'URL'
      },
      {
        column_name: 'api_key',
        title: 'Chave da API',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'data_json',
        title: 'Dados JSON',
        uidt: 'LongText'
      },
      {
        column_name: 'created_at',
        title: 'Criado em',
        uidt: 'DateTime',
        default: 'now()'
      },
      {
        column_name: 'updated_at',
        title: 'Atualizado em',
        uidt: 'DateTime',
        default: 'now()'
      }
    ]
  },
  DashboardStats: {
    table_name: 'dashboard_stats',
    title: 'Estatísticas Dashboard',
    columns: [
      {
        column_name: 'id',
        title: 'ID',
        uidt: 'ID',
        pk: true,
        ai: true,
        rqd: true
      },
      {
        column_name: 'client_id',
        title: 'Cliente ID',
        uidt: 'SingleLineText',
        rqd: true
      },
      {
        column_name: 'date',
        title: 'Data',
        uidt: 'Date',
        rqd: true
      },
      {
        column_name: 'total_disparos',
        title: 'Total de Disparos',
        uidt: 'Number',
        default: 0
      },
      {
        column_name: 'total_notifications',
        title: 'Total de Notificações',
        uidt: 'Number',
        default: 0
      },
      {
        column_name: 'success_rate',
        title: 'Taxa de Sucesso',
        uidt: 'Decimal',
        default: 0
      },
      {
        column_name: 'unique_contacts',
        title: 'Contatos Únicos',
        uidt: 'Number',
        default: 0
      },
      {
        column_name: 'disparos_today',
        title: 'Disparos Hoje',
        uidt: 'Number',
        default: 0
      },
      {
        column_name: 'notifications_today',
        title: 'Notificações Hoje',
        uidt: 'Number',
        default: 0
      },
      {
        column_name: 'created_at',
        title: 'Criado em',
        uidt: 'DateTime',
        default: 'now()'
      },
      {
        column_name: 'updated_at',
        title: 'Atualizado em',
        uidt: 'DateTime',
        default: 'now()'
      }
    ]
  },
  Usuarios: {
    table_name: 'usuarios',
    title: 'Usuários',
    columns: [
      {
        column_name: 'id',
        title: 'ID',
        uidt: 'ID',
        pk: true,
        ai: true,
        rqd: true
      },
      {
        column_name: 'client_id',
        title: 'Cliente ID',
        uidt: 'SingleLineText',
        rqd: true
      },
      {
        column_name: 'email',
        title: 'Email',
        uidt: 'Email',
        rqd: true
      },
      {
        column_name: 'name',
        title: 'Nome',
        uidt: 'SingleLineText'
      },
      {
        column_name: 'role',
        title: 'Função',
        uidt: 'SingleSelect',
        dtxp: "'admin','user','viewer'"
      },
      {
        column_name: 'active',
        title: 'Ativo',
        uidt: 'Checkbox',
        default: true
      },
      {
        column_name: 'last_login',
        title: 'Último Login',
        uidt: 'DateTime'
      },
      {
        column_name: 'preferences',
        title: 'Preferências',
        uidt: 'LongText'
      },
      {
        column_name: 'created_at',
        title: 'Criado em',
        uidt: 'DateTime',
        default: 'now()'
      },
      {
        column_name: 'updated_at',
        title: 'Atualizado em',
        uidt: 'DateTime',
        default: 'now()'
      }
    ]
  }
};
