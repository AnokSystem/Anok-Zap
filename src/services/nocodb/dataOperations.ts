
import { NocodbConfig } from './types';

export class NocodbDataOperations {
  private config: NocodbConfig;
  private headers: Record<string, string>;

  constructor(config: NocodbConfig) {
    this.config = config;
    this.headers = {
      'Content-Type': 'application/json',
      'xc-token': config.apiToken,
    };
  }

  async saveToSpecificTable(baseId: string, tableName: string, data: any): Promise<boolean> {
    try {
      console.log(`Salvando dados na tabela ${tableName}:`, data);
      
      // Primeiro, vamos obter o ID correto da tabela
      const tableId = await this.getTableId(baseId, tableName);
      if (!tableId) {
        console.log(`❌ ID da tabela ${tableName} não encontrado`);
        return false;
      }
      
      console.log(`📋 ID da tabela ${tableName}: ${tableId}`);
      
      // Tentar API v1 com ID da tabela
      let url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`;
      console.log('Tentando salvar (v1 com ID):', url);
      
      let response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Dados salvos com sucesso (v1 com ID):', result);
        return true;
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro v1 com ID ${response.status}:`, errorText);
      }
      
      // Se v1 com ID falhou, tentar v2 com ID
      url = `${this.config.baseUrl}/api/v2/tables/${tableId}/records`;
      console.log('Tentando salvar (v2 com ID):', url);
      
      response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Dados salvos com sucesso (v2 com ID):', result);
        return true;
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro v2 com ID ${response.status}:`, errorText);
      }
      
      return false;
      
    } catch (error) {
      console.log('❌ Erro interno ao salvar:', error);
      return false;
    }
  }

  private async getTableId(baseId: string, tableName: string): Promise<string | null> {
    try {
      console.log(`🔍 Buscando ID da tabela ${tableName} na base ${baseId}...`);
      
      const response = await fetch(`${this.config.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`, {
        headers: this.headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        const tables = data.list || [];
        
        // Procurar pela tabela usando table_name ou title
        const table = tables.find((t: any) => 
          t.table_name === tableName || 
          t.title === tableName ||
          (tableName === 'NotificacoesHotmart' && t.title === 'Notificações Hotmart')
        );
        
        if (table) {
          console.log(`✅ Tabela encontrada:`, table);
          return table.id;
        } else {
          console.log(`❌ Tabela ${tableName} não encontrada nas tabelas disponíveis:`, tables.map(t => ({ id: t.id, table_name: t.table_name, title: t.title })));
        }
      } else {
        console.log(`❌ Erro ao buscar tabelas: ${response.status}`);
      }
      
      return null;
    } catch (error) {
      console.log('❌ Erro ao obter ID da tabela:', error);
      return null;
    }
  }

  saveLocalFallback(type: string, data: any) {
    try {
      const key = `nocodb_fallback_${type}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push({
        ...data,
        saved_at: new Date().toISOString(),
        fallback_reason: 'nocodb_connection_failed'
      });
      localStorage.setItem(key, JSON.stringify(existing));
      console.log(`💾 Dados salvos localmente como fallback: ${key}`);
      console.log('📱 Os dados estão seguros no armazenamento local e serão sincronizados quando o NocoDB estiver disponível');
    } catch (error) {
      console.error('❌ Erro ao salvar fallback local:', error);
    }
  }

  async syncLocalData(baseId: string | null, saveHotmartNotificationFn: (data: any) => Promise<boolean>) {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('nocodb_fallback_'));
      
      for (const key of keys) {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        console.log(`Sincronizando ${data.length} registros de ${key}...`);
        
        for (const record of data) {
          // Remover campos de fallback antes de sincronizar
          const { saved_at, fallback_reason, ...cleanRecord } = record;
          
          if (key.includes('hotmart_notifications')) {
            const success = await saveHotmartNotificationFn(cleanRecord);
            if (success) {
              console.log('✅ Registro sincronizado com sucesso');
            }
          }
        }
        
        // Limpar dados locais após sincronização bem-sucedida
        localStorage.removeItem(key);
        console.log(`🧹 Dados locais de ${key} limpos após sincronização`);
      }
    } catch (error) {
      console.error('Erro ao sincronizar dados locais:', error);
    }
  }
}
