import { NocodbConfig } from './types';

export class ApiOperations {
  private config: NocodbConfig;
  private headers: Record<string, string>;

  constructor(config: NocodbConfig) {
    this.config = config;
    this.headers = {
      'Content-Type': 'application/json',
      'xc-token': config.apiToken,
    };
  }

  async fetchNotifications(baseId: string, tableId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=1000&sort=-CreatedAt`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Dados recebidos:', data);
        console.log(`📊 Total de notificações: ${data.list?.length || 0}`);
        return data.list || [];
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na resposta da API:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error);
      throw error;
    }
  }

  async fetchNotificationsByUser(baseId: string, tableId: string, userId: string): Promise<any[]> {
    try {
      console.log('🔍 Buscando notificações para usuário:', userId);
      
      // Primeiro, buscar todas as notificações para verificar a estrutura
      console.log('📋 Buscando todas as notificações para verificar estrutura...');
      const allNotificationsResponse = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=5`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (allNotificationsResponse.ok) {
        const allData = await allNotificationsResponse.json();
        if (allData.list && allData.list.length > 0) {
          console.log('📋 Estrutura da primeira notificação encontrada:', Object.keys(allData.list[0]));
          console.log('📋 Dados da primeira notificação:', allData.list[0]);
        }
      }

      // Tentar diferentes variações de nomes de colunas para o filtro do usuário
      const possibleUserColumns = [
        'ID do Usuário',
        'ID_do_Usuario',
        'IDdoUsuario',
        'UserId',
        'user_id',
        'UserID'
      ];

      let filteredNotifications: any[] = [];
      let successfulColumn = '';

      // Tentar cada possível nome de coluna
      for (const columnName of possibleUserColumns) {
        try {
          console.log(`🔍 Tentando filtrar por coluna: ${columnName}`);
          
          const response = await fetch(
            `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=1000&sort=-CreatedAt&where=(${encodeURIComponent(columnName)},eq,${userId})`,
            {
              method: 'GET',
              headers: this.headers,
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Sucesso ao filtrar por ${columnName}:`, data.list?.length || 0, 'notificações encontradas');
            filteredNotifications = data.list || [];
            successfulColumn = columnName;
            break;
          } else {
            console.log(`❌ Falha ao filtrar por ${columnName}:`, response.status);
          }
        } catch (error) {
          console.log(`❌ Erro ao tentar filtrar por ${columnName}:`, error.message);
        }
      }

      // Se nenhum filtro funcionou, buscar todas e filtrar localmente
      if (filteredNotifications.length === 0 && !successfulColumn) {
        console.log('⚠️ Nenhuma coluna de usuário encontrada, buscando todas as notificações...');
        
        const response = await fetch(
          `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}?limit=1000&sort=-CreatedAt`,
          {
            method: 'GET',
            headers: this.headers,
          }
        );

        if (response.ok) {
          const data = await response.json();
          const allNotifications = data.list || [];
          
          console.log('📋 Total de notificações encontradas:', allNotifications.length);
          
          // Filtrar localmente por qualquer campo que contenha o userId
          filteredNotifications = allNotifications.filter(notification => {
            // Verificar em múltiplos campos possíveis
            const userFields = [
              notification['ID do Usuário'],
              notification['ID_do_Usuario'],
              notification['IDdoUsuario'],
              notification['UserId'],
              notification['user_id'],
              notification['UserID']
            ];
            
            const matchesUser = userFields.some(field => String(field) === String(userId));
            
            // Também verificar nos dados JSON se existir
            if (!matchesUser && notification['Dados Completos (JSON)']) {
              try {
                const jsonData = JSON.parse(notification['Dados Completos (JSON)']);
                return String(jsonData.userId) === String(userId);
              } catch (e) {
                // Ignorar erro de parse
              }
            }
            
            return matchesUser;
          });
          
          console.log(`📊 Notificações filtradas localmente para usuário ${userId}:`, filteredNotifications.length);
        }
      }

      console.log(`📊 Total de notificações do usuário ${userId}:`, filteredNotifications.length);
      
      // Log das notificações encontradas para debug
      filteredNotifications.forEach((notification, index) => {
        console.log(`📌 Notificação ${index + 1} do usuário:`, {
          ID: notification.ID,
          'Tipo de Evento': notification['Tipo de Evento'],
          'ID do Usuário': notification['ID do Usuário'] || notification['UserId'] || 'não encontrado',
          'Perfil Hotmart': notification['Perfil Hotmart']
        });
      });
      
      return filteredNotifications;
      
    } catch (error) {
      console.error('❌ Erro ao buscar notificações do usuário:', error);
      throw error;
    }
  }

  async createRecord(baseId: string, tableId: string, data: any): Promise<any> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Registro criado:', result);
        return result;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao criar registro:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao criar registro:', error);
      throw error;
    }
  }

  async updateRecord(baseId: string, tableId: string, recordId: string, data: any): Promise<any> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}/${recordId}`,
        {
          method: 'PATCH',
          headers: this.headers,
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Registro atualizado:', result);
        return result;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao atualizar registro:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar registro:', error);
      throw error;
    }
  }

  async deleteRecord(baseId: string, tableId: string, recordId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}/${recordId}`,
        {
          method: 'DELETE',
          headers: this.headers,
        }
      );

      if (response.ok) {
        console.log('✅ Registro excluído com sucesso');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao excluir registro:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao excluir registro:', error);
      return false;
    }
  }

  async getRecordById(baseId: string, tableId: string, recordId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${tableId}/${recordId}`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao buscar registro:', response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao buscar registro por ID:', error);
      return null;
    }
  }
}
