
export interface NocodbConfig {
  baseUrl: string;
  apiToken: string;
}

export interface ConnectionTestResult {
  success: boolean;
  error?: string;
  bases?: DiscoveredBase[];
  targetBase?: string;
}

export interface DiscoveredBase {
  id: string;
  title: string;
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
  dt: string;
  rqd: boolean;
  pk?: boolean;
  ai?: boolean;
  un?: boolean;
  ct?: string;
  nrqd?: boolean;
  ck?: boolean;
  cdf?: any;
  cc?: string;
  csn?: any;
  dtx?: string;
  dtxp?: string;
  dtxs?: string;
  altered?: number;
}

export const TABLE_SCHEMAS = {
  NotificacoesHotmart: {
    title: 'Notificações Hotmart',
    table_name: 'NotificacoesHotmart',
    columns: [
      { title: 'ID do Usuário', column_name: 'user_id', uidt: 'SingleLineText', dt: 'varchar', rqd: false },
      { title: 'Email do Usuário', column_name: 'user_email', uidt: 'Email', dt: 'varchar', rqd: false },
      { title: 'Nome do Produto', column_name: 'product_name', uidt: 'SingleLineText', dt: 'varchar', rqd: false },
      { title: 'ID do Produto', column_name: 'product_id', uidt: 'Number', dt: 'int', rqd: false },
      { title: 'ID da Compra', column_name: 'purchase_id', uidt: 'SingleLineText', dt: 'varchar', rqd: false },
      { title: 'Valor', column_name: 'value', uidt: 'Currency', dt: 'decimal', rqd: false },
      { title: 'Tipo de Evento', column_name: 'event_type', uidt: 'SingleSelect', dt: 'varchar', rqd: false, dtxp: 'purchase,subscription,refund,cancel' },
      { title: 'Plataforma', column_name: 'platform', uidt: 'SingleSelect', dt: 'varchar', rqd: false, dtxp: 'hotmart,eduzz,monetizze' },
      { title: 'Status', column_name: 'status', uidt: 'SingleSelect', dt: 'varchar', rqd: false, dtxp: 'processado,pendente,erro' },
      { title: 'Data do Evento', column_name: 'event_date', uidt: 'DateTime', dt: 'datetime', rqd: false },
      { title: 'Dados JSON', column_name: 'json_data', uidt: 'LongText', dt: 'longtext', rqd: false }
    ]
  },
  
  WhatsAppContacts: {
    title: 'Contatos WhatsApp',
    table_name: 'WhatsAppContacts',
    columns: [
      { title: 'ID do Contato', column_name: 'contact_id', uidt: 'SingleLineText', dt: 'varchar', rqd: false },
      { title: 'Nome', column_name: 'name', uidt: 'SingleLineText', dt: 'varchar', rqd: false },
      { title: 'Número', column_name: 'phone_number', uidt: 'PhoneNumber', dt: 'varchar', rqd: false },
      { title: 'Nome do Grupo', column_name: 'group_name', uidt: 'SingleLineText', dt: 'varchar', rqd: false },
      { title: 'ID da Instância', column_name: 'instance_id', uidt: 'SingleLineText', dt: 'varchar', rqd: false },
      { title: 'Dados JSON', column_name: 'data_json', uidt: 'LongText', dt: 'longtext', rqd: false }
    ]
  },

  WhatsAppInstances: {
    title: 'Instâncias WhatsApp',
    table_name: 'WhatsAppInstances',
    columns: [
      { title: 'ID da Instância', column_name: 'instance_id', uidt: 'SingleLineText', dt: 'varchar', rqd: false },
      { title: 'Nome', column_name: 'name', uidt: 'SingleLineText', dt: 'varchar', rqd: false },
      { title: 'Status', column_name: 'status', uidt: 'SingleSelect', dt: 'varchar', rqd: false, dtxp: 'open,close,connecting' },
      { title: 'Última Atualização', column_name: 'last_updated', uidt: 'DateTime', dt: 'datetime', rqd: false },
      { title: 'Dados JSON', column_name: 'data_json', uidt: 'LongText', dt: 'longtext', rqd: false }
    ]
  },

  MassMessagingLogs: {
    title: 'Logs de Disparo em Massa',
    table_name: 'MassMessagingLogs',
    columns: [
      { title: 'ID da Campanha', column_name: 'campaign_id', uidt: 'SingleLineText', dt: 'varchar', rqd: false },
      { title: 'Nome da Campanha', column_name: 'campaign_name', uidt: 'SingleLineText', dt: 'varchar', rqd: false },
      { title: 'ID da Instância', column_name: 'instance_id', uidt: 'SingleLineText', dt: 'varchar', rqd: false },
      { title: 'Nome da Instância', column_name: 'instance_name', uidt: 'SingleLineText', dt: 'varchar', rqd: false },
      { title: 'Tipo de Mensagem', column_name: 'message_type', uidt: 'SingleSelect', dt: 'varchar', rqd: false, dtxp: 'text,image,video,audio,document' },
      { title: 'Número de Destinatários', column_name: 'recipient_count', uidt: 'Number', dt: 'int', rqd: false },
      { title: 'Mensagens Enviadas', column_name: 'sent_count', uidt: 'Number', dt: 'int', rqd: false },
      { title: 'Mensagens com Erro', column_name: 'error_count', uidt: 'Number', dt: 'int', rqd: false },
      { title: 'Atraso (ms)', column_name: 'delay', uidt: 'Number', dt: 'int', rqd: false },
      { title: 'Status', column_name: 'status', uidt: 'SingleSelect', dt: 'varchar', rqd: false, dtxp: 'iniciado,enviando,concluido,erro,cancelado' },
      { title: 'Data de Início', column_name: 'start_time', uidt: 'DateTime', dt: 'datetime', rqd: false },
      { title: 'Data de Fim', column_name: 'end_time', uidt: 'DateTime', dt: 'datetime', rqd: false },
      { title: 'Dados JSON', column_name: 'data_json', uidt: 'LongText', dt: 'longtext', rqd: false }
    ]
  },

  DashboardStats: {
    title: 'Estatísticas Dashboard',
    table_name: 'DashboardStats',
    columns: [
      { title: 'Data', column_name: 'date', uidt: 'Date', dt: 'date', rqd: false },
      { title: 'Total Disparos', column_name: 'total_disparos', uidt: 'Number', dt: 'int', rqd: false },
      { title: 'Total Notificações', column_name: 'total_notifications', uidt: 'Number', dt: 'int', rqd: false },
      { title: 'Taxa de Sucesso', column_name: 'success_rate', uidt: 'Decimal', dt: 'decimal', rqd: false },
      { title: 'Contatos Únicos', column_name: 'unique_contacts', uidt: 'Number', dt: 'int', rqd: false },
      { title: 'Disparos Hoje', column_name: 'disparos_today', uidt: 'Number', dt: 'int', rqd: false },
      { title: 'Notificações Hoje', column_name: 'notifications_today', uidt: 'Number', dt: 'int', rqd: false }
    ]
  },

  Usuarios: {
    table_name: 'Usuarios',
    title: 'Usuários',
    columns: [
      {
        column_name: 'ID',
        title: 'ID',
        uidt: 'ID',
        dt: 'int',
        pk: true,
        ai: true,
        rqd: false,
        un: true,
        ct: 'int(11)',
        nrqd: false,
        ck: false,
        cdf: null,
        cc: '',
        csn: null,
        dtx: 'specificType',
        dtxp: '',
        dtxs: '',
        altered: 1,
      },
      {
        column_name: 'Email',
        title: 'Email',
        uidt: 'Email',
        dt: 'varchar',
        rqd: true,
      },
      {
        column_name: 'Senha',
        title: 'Senha',
        uidt: 'SingleLineText',
        dt: 'varchar',
        rqd: true,
      },
      {
        column_name: 'Nome',
        title: 'Nome',
        uidt: 'SingleLineText',
        dt: 'varchar',
        rqd: true,
      },
      {
        column_name: 'Ativo',
        title: 'Ativo',
        uidt: 'Checkbox',
        dt: 'boolean',
        rqd: false,
        cdf: true,
      },
      {
        column_name: 'AssinaturaExpira',
        title: 'Assinatura Expira',
        uidt: 'Date',
        dt: 'date',
        rqd: false,
      },
      {
        column_name: 'CreatedAt',
        title: 'CreatedAt',
        uidt: 'DateTime',
        dt: 'timestamp',
        rqd: false,
      },
      {
        column_name: 'UpdatedAt',
        title: 'UpdatedAt',
        uidt: 'DateTime',
        dt: 'timestamp',
        rqd: false,
      },
    ],
  },
  
  Tutoriais: {
    table_name: 'Tutoriais',
    title: 'Tutoriais',
    columns: [
      {
        column_name: 'ID',
        title: 'ID',
        uidt: 'ID',
        dt: 'int',
        pk: true,
        ai: true,
        rqd: false,
        un: true,
        ct: 'int(11)',
        nrqd: false,
        ck: false,
        cdf: null,
        cc: '',
        csn: null,
        dtx: 'specificType',
        dtxp: '',
        dtxs: '',
        altered: 1,
      },
      {
        column_name: 'Titulo',
        title: 'Título',
        uidt: 'SingleLineText',
        dt: 'varchar',
        rqd: true,
      },
      {
        column_name: 'Conteudo',
        title: 'Conteúdo',
        uidt: 'LongText',
        dt: 'longtext',
        rqd: true,
      },
      {
        column_name: 'CreatedAt',
        title: 'CreatedAt',
        uidt: 'DateTime',
        dt: 'timestamp',
        rqd: false,
      },
      {
        column_name: 'UpdatedAt',
        title: 'UpdatedAt',
        uidt: 'DateTime',
        dt: 'timestamp',
        rqd: false,
      },
    ],
  },
};
