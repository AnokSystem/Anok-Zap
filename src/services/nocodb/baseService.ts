
import { NocodbConfig } from './types';

export abstract class BaseNocodbService {
  protected config: NocodbConfig;
  protected headers: Record<string, string>;

  constructor(config: NocodbConfig) {
    this.config = config;
    this.headers = {
      'Content-Type': 'application/json',
      'xc-token': config.apiToken,
    };
  }

  protected async getTableId(baseId: string, tableName: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`, {
        headers: this.headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        const tables = data.list || [];
        
        const table = tables.find((t: any) => 
          t.table_name === tableName || 
          t.title === tableName ||
          (tableName === 'NotificacoesHotmart' && t.title === 'Notificações Hotmart')
        );
        
        return table?.id || null;
      }
      
      return null;
    } catch (error) {
      console.log('❌ Erro ao obter ID da tabela:', error);
      return null;
    }
  }
}
