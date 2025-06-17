
import { TableSchema } from './core';

export const Usuarios: TableSchema = {
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
};
