
import { TableSchema } from './core';

export const WhatsAppContacts: TableSchema = {
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
};

export const WhatsAppInstances: TableSchema = {
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
};
