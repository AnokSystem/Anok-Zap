
import { TableSchema } from './core';

export const MassMessagingLogs: TableSchema = {
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
      column_name: 'contacts_reached',
      title: 'Contatos Alcançados',
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
};
