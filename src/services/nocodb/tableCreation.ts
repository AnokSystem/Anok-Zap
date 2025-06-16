
import { NocodbConfig, TableSchema, TABLE_SCHEMAS } from './types';
import { TableOperations } from './tableOperations';

export class TableCreation extends TableOperations {
  constructor(config: NocodbConfig) {
    super(config);
  }

  async createTable(baseId: string, schema: TableSchema): Promise<boolean> {
    try {
      console.log(`🏗️ Criando tabela ${schema.title} na base ${baseId}...`);
      
      // Verificar se a tabela já existe antes de tentar criar
      const tableExists = await this.checkTableExists(baseId, schema.table_name, schema.title);
      if (tableExists) {
        console.log(`✅ Tabela ${schema.title} já existe`);
        return true;
      }
      
      console.log('📋 Schema da tabela:', JSON.stringify(schema, null, 2));
      
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
        
        // Se o erro for 400 e mencionar que já existe, considerar como sucesso
        if (response.status === 400 && (errorText.includes('already exists') || errorText.includes('já existe'))) {
          console.log(`ℹ️ Tabela ${schema.title} já existe (confirmado por erro 400)`);
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
      console.log('🎯 Base target:', baseId);
      
      if (!baseId) {
        console.log('❌ Base "Notificação Inteligente" não encontrada, não é possível criar tabelas');
        return false;
      }

      const results = [];
      
      // Criar cada tabela definida no schema
      for (const [tableName, schema] of Object.entries(TABLE_SCHEMAS)) {
        console.log(`📋 Criando tabela: ${tableName} (${schema.title})...`);
        
        try {
          const success = await this.createTable(baseId, schema);
          results.push({ tableName, success });
          
          if (success) {
            console.log(`✅ Tabela ${tableName} criada/verificada com sucesso`);
          } else {
            console.log(`❌ Falha ao criar tabela ${tableName}`);
          }
          
          // Pequeno delay entre criações para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.log(`❌ Erro ao criar tabela ${tableName}:`, error);
          results.push({ tableName, success: false, error });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      console.log(`🎯 Processo concluído: ${successCount}/${totalCount} tabelas criadas/verificadas com sucesso`);
      console.log('📊 Resumo detalhado:', results);
      
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

      console.log(`🔧 Verificando/criando tabela ${tableName} na base ${baseId}...`);

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
      const created = await this.createTable(baseId, schema);
      
      if (created) {
        console.log(`✅ Tabela ${tableName} criada com sucesso`);
      } else {
        console.log(`❌ Falha ao criar tabela ${tableName}`);
      }
      
      return created;
      
    } catch (error) {
      console.log(`❌ Erro ao verificar/criar tabela ${tableName}:`, error);
      return false;
    }
  }
}
