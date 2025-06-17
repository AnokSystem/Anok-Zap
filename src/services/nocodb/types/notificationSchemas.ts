
import { TableSchema } from './core';

export const NotificacoesPlataformas: TableSchema = {
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
};

export const NotificacoesHotmart: TableSchema = {
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
};
