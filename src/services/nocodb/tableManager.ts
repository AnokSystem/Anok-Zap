
import { NocodbConfig, TableSchema, DiscoveredBase, TABLE_SCHEMAS } from './types';

export class NocodbTableManager {
  private config: NocodbConfig;
  private headers: Record<string, string>;
  private discoveredBases: DiscoveredBase[] = [];
  private targetBaseId: string | null = null;

  constructor(config: NocodbConfig) {
    this.config = config;
    this.headers = {
      'Content-Type': 'application/json',
      'xc-token': config.apiToken,
    };
  }

  async discoverBases() {
    try {
      console.log('Descobrindo bases disponíveis no NocoDB...');
      
      const response = await fetch(`${this.config.baseUrl}/api/v1/db/meta/projects`, {
        method: 'GET',
        headers: this.headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Bases descobertas:', data);
        this.discoveredBases = data.list || [];
        
        // Procurar especificamente pela base "Notificação Inteligente"
        const notificationBase = this.discoveredBases.find(base => 
          base.title === 'Notificação Inteligente' || 
          base.title.toLowerCase().includes('notificação') ||
          base.title.toLowerCase().includes('notificacao')
        );
        
        if (notificationBase) {
          this.targetBaseId = notificationBase.id;
          console.log('✅ Base "Notificação Inteligente" encontrada:', notificationBase);
        } else {
          console.log('❌ Base "Notificação Inteligente" não encontrada nas bases disponíveis');
        }
        
        return data;
      } else {
        console.log('Erro ao descobrir bases:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Erro ao descobrir bases:', error);
      return null;
    }
  }

  async createAllTables() {
    try {
      console.log('🏗️ Iniciando criação de todas as tabelas necessárias...');
      
      // Primeiro descobre as bases se ainda não foram descobertas
      if (!this.targetBaseId) {
        await this.discoverBases();
      }
      
      if (!this.targetBaseId) {
        console.log('❌ Base "Notificação Inteligente" não encontrada, não é possível criar tabelas');
        return false;
      }

      const results = [];
      
      // Criar cada tabela definida no schema
      for (const [tableName, schema] of Object.entries(TABLE_SCHEMAS)) {
        console.log(`📋 Criando tabela: ${tableName}...`);
        
        try {
          const success = await this.createTable(this.targetBaseId, schema);
          results.push({ tableName, success });
          
          if (success) {
            console.log(`✅ Tabela ${tableName} criada com sucesso`);
          } else {
            console.log(`❌ Falha ao criar tabela ${tableName}`);
          }
        } catch (error) {
          console.log(`❌ Erro ao criar tabela ${tableName}:`, error);
          results.push({ tableName, success: false, error });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      console.log(`🎯 Processo concluído: ${successCount}/${totalCount} tabelas criadas com sucesso`);
      console.log('📊 Resumo:', results);
      
      return successCount > 0;
    } catch (error) {
      console.error('❌ Erro geral ao criar tabelas:', error);
      return false;
    }
  }

  async ensureTableExists(tableName: string): Promise<boolean> {
    try {
      if (!this.targetBaseId) {
        await this.discoverBases();
      }
      
      if (!this.targetBaseId) {
        console.log('❌ Base não encontrada, não é possível verificar tabela');
        return false;
      }

      // Verificar se a tabela já existe
      const tables = await this.getTablesFromBase(this.targetBaseId);
      const tableExists = tables.some(table => 
        table.table_name === tableName || 
        table.title === TABLE_SCHEMAS[tableName]?.title
      );
      
      if (tableExists) {
        console.log(`✅ Tabela ${tableName} já existe`);
        return true;
      }
      
      // Criar a tabela se não existir
      const schema = TABLE_SCHEMAS[tableName];
      if (!schema) {
        console.log(`❌ Schema não encontrado para tabela ${tableName}`);
        return false;
      }
      
      console.log(`📋 Criando tabela ${tableName}...`);
      return await this.createTable(this.targetBaseId, schema);
      
    } catch (error) {
      console.log(`❌ Erro ao verificar/criar tabela ${tableName}:`, error);
      return false;
    }
  }

  private async createTable(baseId: string, schema: TableSchema): Promise<boolean> {
    try {
      console.log(`Criando tabela ${schema.title} na base ${baseId}...`);
      console.log('Schema da tabela:', schema);
      
      const response = await fetch(`${this.config.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(schema),
      });
      
      if (response.ok) {
        const tableResult = await response.json();
        console.log(`✅ Tabela ${schema.title} criada com sucesso:`, tableResult);
        return true;
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro ao criar tabela ${schema.title}:`, response.status, errorText);
        
        // Se o erro for 400, pode ser que a tabela já existe
        if (response.status === 400 && errorText.includes('already exists')) {
          console.log(`ℹ️ Tabela ${schema.title} já existe`);
          return true;
        }
        
        return false;
      }
      
    } catch (error) {
      console.log(`❌ Erro interno ao criar tabela ${schema.title}:`, error);
      return false;
    }
  }

  private async getTablesFromBase(baseId: string) {
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

  getTargetBaseId(): string | null {
    return this.targetBaseId;
  }

  getDiscoveredBases(): DiscoveredBase[] {
    return this.discoveredBases;
  }
}
