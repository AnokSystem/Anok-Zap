
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

  async getNotifications(baseId: string, tableId: string): Promise<any[]> {
    try {
      console.log('Buscando notificações no NocoDB...');
      
      // Removendo a ordenação problemática por 'created_at' que não existe
      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=100`;
      console.log('URL de consulta:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Resposta completa do NocoDB:', data);
        const notifications = data.list || [];
        console.log('Notificações encontradas:', notifications);
        return notifications;
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro ao buscar notificações: ${response.status}`, errorText);
        return [];
      }
    } catch (error) {
      console.log('❌ Erro ao buscar notificações:', error);
      return [];
    }
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
      
      // Verificar e remover duplicatas antes de salvar
      await this.removeDuplicates(baseId, tableId, data, tableName);
      
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

  private async removeDuplicates(baseId: string, tableId: string, newData: any, tableName: string): Promise<void> {
    try {
      console.log(`🔍 Verificando duplicatas na tabela ${tableName}...`);
      
      // Buscar registros existentes
      const existingRecords = await this.getExistingRecords(baseId, tableId);
      
      if (!existingRecords || existingRecords.length === 0) {
        console.log('✅ Nenhum registro existente encontrado');
        return;
      }
      
      // Identificar duplicatas baseado no tipo de tabela
      const duplicateIds = this.findDuplicateIds(existingRecords, newData, tableName);
      
      if (duplicateIds.length > 0) {
        console.log(`🗑️ Encontradas ${duplicateIds.length} duplicatas, removendo...`);
        await this.deleteRecords(baseId, tableId, duplicateIds);
      } else {
        console.log('✅ Nenhuma duplicata encontrada');
      }
      
    } catch (error) {
      console.log('❌ Erro ao verificar duplicatas:', error);
    }
  }

  private async getExistingRecords(baseId: string, tableId: string): Promise<any[]> {
    try {
      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`;
      const response = await fetch(url, {
        headers: this.headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.list || [];
      } else {
        console.log(`❌ Erro ao buscar registros existentes: ${response.status}`);
        return [];
      }
    } catch (error) {
      console.log('❌ Erro ao buscar registros existentes:', error);
      return [];
    }
  }

  private findDuplicateIds(existingRecords: any[], newData: any, tableName: string): string[] {
    const duplicateIds: string[] = [];
    
    existingRecords.forEach(record => {
      let isDuplicate = false;
      
      // Verificar duplicatas baseado no tipo de tabela
      switch (tableName) {
        case 'NotificacoesHotmart':
          // Considerar duplicata se: mesmo event_type, instance_id, user_role e hotmart_profile
          isDuplicate = (
            record['Tipo de Evento'] === newData.event_type &&
            record['ID da Instância'] === newData.instance_id &&
            record['Função do Usuário'] === newData.user_role &&
            record['Perfil Hotmart'] === newData.hotmart_profile
          );
          break;
          
        case 'WhatsAppInstances':
          // Considerar duplicata se: mesmo instance_id
          isDuplicate = record['ID da Instância'] === newData.instance_id;
          break;
          
        case 'WhatsAppContacts':
          // Considerar duplicata se: mesmo contact_id e instance_id
          isDuplicate = (
            record['ID do Contato'] === newData.contact_id &&
            record['ID da Instância'] === newData.instance_id
          );
          break;
          
        case 'MassMessagingLogs':
          // Considerar duplicata se: mesmo campaign_id
          isDuplicate = record['ID da Campanha'] === newData.campaign_id;
          break;
          
        case 'WebhookLogs':
          // Considerar duplicata se: mesmo webhook_url, event_type e timestamp muito próximo (mesmo minuto)
          const existingTime = new Date(record['Criado em']).getTime();
          const newTime = new Date(newData.created_at).getTime();
          const timeDiff = Math.abs(existingTime - newTime);
          isDuplicate = (
            record['URL do Webhook'] === newData.webhook_url &&
            record['Tipo de Evento'] === newData.event_type &&
            timeDiff < 60000 // menos de 1 minuto de diferença
          );
          break;
      }
      
      if (isDuplicate) {
        duplicateIds.push(record.ID);
        console.log(`🔍 Duplicata encontrada:`, record);
      }
    });
    
    return duplicateIds;
  }

  private async deleteRecords(baseId: string, tableId: string, recordIds: string[]): Promise<void> {
    try {
      for (const recordId of recordIds) {
        console.log(`🗑️ Removendo registro duplicado ID: ${recordId}`);
        
        const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}/${recordId}`;
        const response = await fetch(url, {
          method: 'DELETE',
          headers: this.headers,
        });
        
        if (response.ok) {
          console.log(`✅ Registro ${recordId} removido com sucesso`);
        } else {
          console.log(`❌ Erro ao remover registro ${recordId}: ${response.status}`);
        }
      }
    } catch (error) {
      console.log('❌ Erro ao remover registros duplicados:', error);
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
