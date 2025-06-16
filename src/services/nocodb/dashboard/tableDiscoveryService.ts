
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';
import { TableCreationService } from './tableCreationService';

export class TableDiscoveryService extends BaseNocodbService {
  private tableCreationService: TableCreationService;

  constructor(config: NocodbConfig) {
    super(config);
    this.tableCreationService = new TableCreationService(config);
  }

  async discoverTableIds(baseId: string): Promise<{
    disparosTableId: string | null;
    notificationsTableId: string | null;
  }> {
    try {
      console.log('🔍 Descobrindo IDs das tabelas na base:', baseId);
      
      // Usar os IDs específicos das tabelas fornecidos pelo usuário
      const disparosTableId = 'myx4lsmm5i02xcd';
      const notificationsTableId = 'mzup2t8ygoiy5ub';
      
      // Verificar se as tabelas existem
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`,
        {
          headers: this.headers,
        }
      );

      if (!response.ok) {
        console.error('❌ Erro ao buscar tabelas:', response.status);
        return { disparosTableId, notificationsTableId };
      }

      const data = await response.json();
      const tables = data.list || [];
      
      console.log('📋 Tabelas encontradas:', tables.map(t => ({ id: t.id, title: t.title, table_name: t.table_name })));

      // Verificar se as tabelas específicas existem
      const disparosTable = tables.find((t: any) => t.id === disparosTableId);
      const notificationsTable = tables.find((t: any) => t.id === notificationsTableId);

      if (disparosTable) {
        console.log('✅ Tabela de disparos encontrada:', disparosTable.title || disparosTable.table_name);
      } else {
        console.log('⚠️ Tabela de disparos com ID myx4lsmm5i02xcd não encontrada');
      }

      if (notificationsTable) {
        console.log('✅ Tabela de notificações encontrada:', notificationsTable.title || notificationsTable.table_name);
      } else {
        console.log('⚠️ Tabela de notificações com ID mzup2t8ygoiy5ub não encontrada');
      }

      const result = {
        disparosTableId: disparosTable ? disparosTableId : null,
        notificationsTableId: notificationsTable ? notificationsTableId : null
      };

      console.log('✅ IDs descobertos:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao descobrir tabelas:', error);
      // Retornar os IDs mesmo em caso de erro para tentar usar as tabelas
      return { 
        disparosTableId: 'myx4lsmm5i02xcd', 
        notificationsTableId: 'mzup2t8ygoiy5ub' 
      };
    }
  }

  async createDisparosTable(baseId: string): Promise<string | null> {
    return await this.tableCreationService.createDisparosTable(baseId);
  }

  async createNotificationsTable(baseId: string): Promise<string | null> {
    return await this.tableCreationService.createNotificationsTable(baseId);
  }
}
