
import { NocodbConfig } from './types';

export class TableOperations {
  protected config: NocodbConfig;
  protected headers: Record<string, string>;

  constructor(config: NocodbConfig) {
    this.config = config;
    this.headers = {
      'Content-Type': 'application/json',
      'xc-token': config.apiToken,
    };
  }

  async getTablesFromBase(baseId: string) {
    try {
      console.log(`Buscando tabelas da base ${baseId}...`);
      const response = await fetch(`${this.config.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`, {
        headers: this.headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Tabelas encontradas:', data.list);
        return data.list || [];
      } else {
        console.log('Erro ao obter tabelas:', response.status, response.statusText);
      }
      return [];
    } catch (error) {
      console.log('Erro ao obter tabelas:', error);
      return [];
    }
  }

  async checkTableExists(baseId: string, tableName: string, expectedTitle?: string): Promise<boolean> {
    const tables = await this.getTablesFromBase(baseId);
    return tables.some(table => 
      table.table_name === tableName || 
      table.title === expectedTitle ||
      table.title === tableName
    );
  }
}
