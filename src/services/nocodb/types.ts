
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
    table_name: 'NotificacoesHotmart',
    title: 'Notificações Hotmart',
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
        column_name: 'TipoEvento',
        title: 'Tipo de Evento',
        uidt: 'SingleLineText',
        dt: 'varchar',
        rqd: true,
      },
      {
        column_name: 'Plataforma',
        title: 'Plataforma',
        uidt: 'SingleLineText',
        dt: 'varchar',
        rqd: false,
      },
      {
        column_name: 'PerfilHotmart',
        title: 'Perfil Hotmart',
        uidt: 'SingleLineText',
        dt: 'varchar',
        rqd: false,
      },
      {
        column_name: 'IDInstancia',
        title: 'ID da Instância',
        uidt: 'SingleLineText',
        dt: 'varchar',
        rqd: true,
      },
      {
        column_name: 'PapelUsuario',
        title: 'Papel do Usuário',
        uidt: 'SingleLineText',
        dt: 'varchar',
        rqd: false,
      },
      {
        column_name: 'ContMensagens',
        title: 'Contagem de Mensagens',
        uidt: 'Number',
        dt: 'int',
        rqd: false,
      },
      {
        column_name: 'URLWebhook',
        title: 'URL do Webhook',
        uidt: 'URL',
        dt: 'varchar',
        rqd: false,
      },
      {
        column_name: 'DadosCompletos',
        title: 'Dados Completos (JSON)',
        uidt: 'LongText',
        dt: 'longtext',
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
  MassMessagingLogs: {
    table_name: 'MassMessagingLogs',
    title: 'Logs de Disparo em Massa',
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
        column_name: 'CampanhaID',
        title: 'ID da Campanha',
        uidt: 'SingleLineText',
        dt: 'varchar',
        rqd: true,
      },
      {
        column_name: 'InstanciaID',
        title: 'ID da Instância',
        uidt: 'SingleLineText',
        dt: 'varchar',
        rqd: true,
      },
      {
        column_name: 'TotalContatos',
        title: 'Total de Contatos',
        uidt: 'Number',
        dt: 'int',
        rqd: false,
      },
      {
        column_name: 'MensagensEnviadas',
        title: 'Mensagens Enviadas',
        uidt: 'Number',
        dt: 'int',
        rqd: false,
      },
      {
        column_name: 'MensagensFalharam',
        title: 'Mensagens que Falharam',
        uidt: 'Number',
        dt: 'int',
        rqd: false,
      },
      {
        column_name: 'Status',
        title: 'Status',
        uidt: 'SingleSelect',
        dt: 'varchar',
        rqd: false,
        dtxp: "'iniciado','processando','concluido','erro'",
      },
      {
        column_name: 'DadosCampanha',
        title: 'Dados da Campanha (JSON)',
        uidt: 'LongText',
        dt: 'longtext',
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
  WhatsAppContacts: {
    table_name: 'WhatsAppContacts',
    title: 'Contatos WhatsApp',
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
        column_name: 'InstanciaID',
        title: 'ID da Instância',
        uidt: 'SingleLineText',
        dt: 'varchar',
        rqd: true,
      },
      {
        column_name: 'Nome',
        title: 'Nome',
        uidt: 'SingleLineText',
        dt: 'varchar',
        rqd: false,
      },
      {
        column_name: 'Telefone',
        title: 'Telefone',
        uidt: 'PhoneNumber',
        dt: 'varchar',
        rqd: true,
      },
      {
        column_name: 'Grupo',
        title: 'Grupo',
        uidt: 'SingleLineText',
        dt: 'varchar',
        rqd: false,
      },
      {
        column_name: 'Admin',
        title: 'É Admin',
        uidt: 'Checkbox',
        dt: 'boolean',
        rqd: false,
        cdf: false,
      },
      {
        column_name: 'CreatedAt',
        title: 'CreatedAt',
        uidt: 'DateTime',
        dt: 'timestamp',
        rqd: false,
      },
    ],
  },
  WhatsAppInstances: {
    table_name: 'WhatsAppInstances',
    title: 'Instâncias WhatsApp',
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
        column_name: 'InstanciaID',
        title: 'ID da Instância',
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
        column_name: 'Status',
        title: 'Status',
        uidt: 'SingleSelect',
        dt: 'varchar',
        rqd: false,
        dtxp: "'conectado','desconectado','conectando'",
      },
      {
        column_name: 'Dados',
        title: 'Dados (JSON)',
        uidt: 'LongText',
        dt: 'longtext',
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
};
