
export const DISPAROS_TABLE_SCHEMA = {
  table_name: 'disparo_em_massa',
  title: 'Disparo em Massa',
  columns: [
    {
      column_name: 'id',
      title: 'ID',
      uidt: 'ID',
      pk: true,
      ai: true
    },
    {
      column_name: 'campaign_name',
      title: 'Nome da Campanha',
      uidt: 'SingleLineText'
    },
    {
      column_name: 'instance_name',
      title: 'Nome da Instância',
      uidt: 'SingleLineText'
    },
    {
      column_name: 'instance_id',
      title: 'ID da Instância',
      uidt: 'SingleLineText'
    },
    {
      column_name: 'recipient_count',
      title: 'Número de Destinatários',
      uidt: 'Number'
    },
    {
      column_name: 'sent_count',
      title: 'Mensagens Enviadas',
      uidt: 'Number'
    },
    {
      column_name: 'error_count',
      title: 'Erros',
      uidt: 'Number'
    },
    {
      column_name: 'status',
      title: 'Status',
      uidt: 'SingleSelect',
      colOptions: {
        options: [
          { title: 'Pendente', color: '#fbbf24' },
          { title: 'Enviando', color: '#3b82f6' },
          { title: 'Concluído', color: '#10b981' },
          { title: 'Erro', color: '#ef4444' },
          { title: 'Cancelado', color: '#6b7280' }
        ]
      }
    },
    {
      column_name: 'message_type',
      title: 'Tipo de Mensagem',
      uidt: 'SingleLineText'
    },
    {
      column_name: 'start_time',
      title: 'Hora de Início',
      uidt: 'DateTime'
    },
    {
      column_name: 'client_id',
      title: 'ID do Cliente',
      uidt: 'SingleLineText'
    }
  ]
};

export const NOTIFICATIONS_TABLE_SCHEMA = {
  table_name: 'notificacoes_plataformas',
  title: 'Notificações das Plataformas',
  columns: [
    {
      column_name: 'id',
      title: 'ID',
      uidt: 'ID',
      pk: true,
      ai: true
    },
    {
      column_name: 'event_type',
      title: 'Tipo de Evento',
      uidt: 'SingleLineText'
    },
    {
      column_name: 'platform',
      title: 'Plataforma',
      uidt: 'SingleSelect',
      colOptions: {
        options: [
          { title: 'Hotmart', color: '#8b5cf6' },
          { title: 'Eduzz', color: '#3b82f6' },
          { title: 'Monetizze', color: '#10b981' },
          { title: 'Outras', color: '#6b7280' }
        ]
      }
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
      column_name: 'product_name',
      title: 'Nome do Produto',
      uidt: 'SingleLineText'
    },
    {
      column_name: 'value',
      title: 'Valor',
      uidt: 'Decimal'
    },
    {
      column_name: 'transaction_id',
      title: 'ID da Transação',
      uidt: 'SingleLineText'
    },
    {
      column_name: 'status',
      title: 'Status',
      uidt: 'SingleSelect',
      colOptions: {
        options: [
          { title: 'Aprovado', color: '#10b981' },
          { title: 'Pendente', color: '#fbbf24' },
          { title: 'Cancelado', color: '#ef4444' },
          { title: 'Reembolsado', color: '#f97316' }
        ]
      }
    },
    {
      column_name: 'event_date',
      title: 'Data do Evento',
      uidt: 'DateTime'
    },
    {
      column_name: 'client_id',
      title: 'ID do Cliente',
      uidt: 'SingleLineText'
    }
  ]
};
