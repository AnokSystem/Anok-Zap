
import { NocodbConfig, TableSchema, TABLE_SCHEMAS } from './types';
import { TableOperations } from './tableOperations';

export class TableCreation extends TableOperations {
  constructor(config: NocodbConfig) {
    super(config);
  }

  async createTable(baseId: string, schema: TableSchema): Promise<boolean> {
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

  async createAllTables(baseId: string) {
    try {
      console.log('🏗️ Iniciando criação de todas as tabelas necessárias...');
      
      if (!baseId) {
        console.log('❌ Base "Notificação Inteligente" não encontrada, não é possível criar tabelas');
        return false;
      }

      const results = [];
      
      // Criar cada tabela definida no schema
      for (const [tableName, schema] of Object.entries(TABLE_SCHEMAS)) {
        console.log(`📋 Criando tabela: ${tableName}...`);
        
        try {
          const success = await this.createTable(baseId, schema);
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

  async ensureTableExists(baseId: string, tableName: string): Promise<boolean> {
    try {
      if (!baseId) {
        console.log('❌ Base não encontrada, não é possível verificar tabela');
        return false;
      }

      // Verificar se a tabela já existe
      const expectedTitle = TABLE_SCHEMAS[tableName]?.title;
      const tableExists = await this.checkTableExists(baseId, tableName, expectedTitle);
      
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
      return await this.createTable(baseId, schema);
      
    } catch (error) {
      console.log(`❌ Erro ao verificar/criar tabela ${tableName}:`, error);
      return false;
    }
  }
}
