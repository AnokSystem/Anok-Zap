
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
    return await this.tableCreationService.createDisparosTable(baseId);
  }

  async createNotificationsTable(baseId: string): Promise<string | null> {
    return await this.tableCreationService.createNotificationsTable(baseId);
  }
}
