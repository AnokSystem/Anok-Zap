
import { TableSchema } from './core';

export const DashboardStats: TableSchema = {
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
};
