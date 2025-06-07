
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
      
      // Tentar API v1 primeiro
      let url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableName}`;
      console.log('Tentando salvar (v1):', url);
      
      let response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Dados salvos com sucesso (v1):', result);
        return true;
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro v1 ${response.status}:`, errorText);
      }
      
      // Se v1 falhou, tentar v2
      url = `${this.config.baseUrl}/api/v2/tables/${tableName}/records`;
      console.log('Tentando salvar (v2):', url);
      
      response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Dados salvos com sucesso (v2):', result);
        return true;
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro v2 ${response.status}:`, errorText);
      }
      
      return false;
      
    } catch (error) {
      console.log('❌ Erro interno ao salvar:', error);
      return false;
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
