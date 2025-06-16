
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';
import { DISPAROS_TABLE_SCHEMA, NOTIFICATIONS_TABLE_SCHEMA } from './tableSchemas';

export class TableCreationService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  async createDisparosTable(baseId: string): Promise<string | null> {
    try {
      console.log('🏗️ Criando tabela de Disparos em Massa...');
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(DISPAROS_TABLE_SCHEMA)
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
      
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(NOTIFICATIONS_TABLE_SCHEMA)
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
