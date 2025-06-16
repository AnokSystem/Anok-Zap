
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';

export class TableDiscoveryService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  async discoverTableIds(baseId: string): Promise<{
    disparosTableId: string | null;
    notificationsTableId: string | null;
  }> {
    try {
      console.log('🔍 Descobrindo IDs das tabelas na base:', baseId);
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`,
        {
          headers: this.headers,
        }
      );

      if (!response.ok) {
        console.error('❌ Erro ao buscar tabelas:', response.status);
        return { disparosTableId: null, notificationsTableId: null };
      }

      const data = await response.json();
      const tables = data.list || [];
      
      console.log('📋 Tabelas encontradas:', tables.map(t => ({ id: t.id, title: t.title, table_name: t.table_name })));

      // Procurar tabela de disparos
      const disparosTable = tables.find((t: any) => 
        t.title?.toLowerCase().includes('disparo') ||
        t.title?.toLowerCase().includes('massa') ||
        t.table_name?.toLowerCase().includes('disparo') ||
        t.table_name?.toLowerCase().includes('massa') ||
        t.id === 'myx4lsmm5i02xcd'
      );

      // Procurar tabela de notificações
      const notificationsTable = tables.find((t: any) => 
        t.title?.toLowerCase().includes('notifica') ||
        t.title?.toLowerCase().includes('plataforma') ||
        t.table_name?.toLowerCase().includes('notifica') ||
        t.table_name?.toLowerCase().includes('plataforma') ||
        t.id === 'mzup2t8ygoiy5ub'
      );

      const result = {
        disparosTableId: disparosTable?.id || null,
        notificationsTableId: notificationsTable?.id || null
      };

      console.log('✅ IDs descobertos:', result);
      
      if (!result.disparosTableId) {
        console.log('⚠️ Tabela de disparos não encontrada, tentando criar...');
      }
      
      if (!result.notificationsTableId) {
        console.log('⚠️ Tabela de notificações não encontrada, tentando criar...');
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao descobrir tabelas:', error);
      return { disparosTableId: null, notificationsTableId: null };
    }
  }

  async createDisparosTable(baseId: string): Promise<string | null> {
    try {
      console.log('🏗️ Criando tabela de Disparos em Massa...');
      
      const tableData = {
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

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(tableData)
        }
      );

      if (response.ok) {
        const newTable = await response.json();
        console.log('✅ Tabela de disparos criada:', newTable.id);
        return newTable.id;
      } else {
        console.error('❌ Erro ao criar tabela de disparos:', response.status);
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao criar tabela de disparos:', error);
      return null;
    }
  }

  async createNotificationsTable(baseId: string): Promise<string | null> {
    try {
      console.log('🏗️ Criando tabela de Notificações...');
      
      const tableData = {
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

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(tableData)
        }
      );

      if (response.ok) {
        const newTable = await response.json();
        console.log('✅ Tabela de notificações criada:', newTable.id);
        return newTable.id;
      } else {
        console.error('❌ Erro ao criar tabela de notificações:', response.status);
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao criar tabela de notificações:', error);
      return null;
    }
  }
}
