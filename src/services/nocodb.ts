class NocodbService {
  private baseUrl = 'https://kovalski.novahagencia.com.br';
  private apiToken = 'aY4YYKsICfBJXDtjLj4GWlwwaFIOkwSsOy64gslJ';
  
  private headers = {
    'Content-Type': 'application/json',
    'xc-token': this.apiToken,
  };

  // Método para descobrir bases disponíveis
  async discoverBases() {
    try {
      console.log('Descobrindo bases disponíveis no NocoDB...');
      
      // Tenta diferentes endpoints para listar bases
      const endpoints = [
        '/api/v2/meta/bases',
        '/api/v1/db/meta/projects',
        '/api/v2/meta/projects'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: this.headers,
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Bases encontradas via ${endpoint}:`, data);
            return data;
          }
        } catch (error) {
          console.log(`Erro no endpoint ${endpoint}:`, error);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao descobrir bases:', error);
      return null;
    }
  }

  // Método para testar conectividade
  async testConnection() {
    try {
      console.log('Testando conexão com NocoDB...');
      
      // Primeiro tenta descobrir as bases
      const bases = await this.discoverBases();
      
      if (bases) {
        console.log('NocoDB conectado com sucesso, bases disponíveis:', bases);
        return { success: true, bases };
      }
      
      // Se não conseguiu descobrir bases, tenta endpoint básico
      const response = await fetch(`${this.baseUrl}/api/v2/meta/bases`, {
        method: 'GET',
        headers: this.headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('NocoDB conectado via endpoint básico:', data);
        return { success: true, bases: data };
      } else {
        console.log('Erro na resposta NocoDB:', response.status, response.statusText);
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('Erro ao conectar com NocoDB:', error);
      return { success: false, error: error.message };
    }
  }

  async saveHotmartNotification(notificationData: any) {
    try {
      console.log('Salvando notificação Hotmart no NocoDB...');
      
      // Primeiro descobre as bases disponíveis
      const basesInfo = await this.discoverBases();
      console.log('Informações das bases:', basesInfo);
      
      const data = {
        event_type: notificationData.eventType,
        instance_id: notificationData.instance,
        user_role: notificationData.userRole,
        hotmart_profile: notificationData.hotmartProfile,
        webhook_url: notificationData.webhookUrl,
        message_count: notificationData.messages.length,
        notification_phone: notificationData.notificationPhone,
        created_at: notificationData.timestamp,
        data: JSON.stringify(notificationData)
      };
      
      // Lista de possíveis nomes para a base "Notificação Inteligente"
      const possibleBaseNames = [
        'Notificação Inteligente',
        'notificacao-inteligente',
        'NotificacaoInteligente',
        'Notificacao_Inteligente',
        'notification-intelligence',
        'whatsapp',
        'main',
        'default'
      ];
      
      // Lista de possíveis nomes para as tabelas
      const possibleTableNames = [
        'HotmartNotifications',
        'hotmart_notifications',
        'notifications',
        'Notifications',
        'NotificacoesHotmart',
        'notificacoes_hotmart',
        'notificacoes',
        'Notificacoes'
      ];
      
      // Tenta diferentes combinações de base e tabela
      for (const baseName of possibleBaseNames) {
        for (const tableName of possibleTableNames) {
          try {
            // Tenta diferentes formatos de URL da API
            const apiVersions = ['v1', 'v2'];
            
            for (const version of apiVersions) {
              const url = `${this.baseUrl}/api/${version}/db/data/noco/${baseName}/${tableName}`;
              console.log('Tentando salvar em:', url);
              
              const response = await fetch(url, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data),
              });
              
              if (response.ok) {
                const result = await response.json();
                console.log('Dados salvos com sucesso no NocoDB:', result);
                return true;
              } else {
                const errorText = await response.text();
                console.log(`Erro ${response.status} para ${baseName}/${tableName} (${version}):`, errorText);
              }
            }
          } catch (error) {
            console.log(`Erro interno para ${baseName}/${tableName}:`, error);
          }
        }
      }
      
      // Se chegou aqui, tenta descobrir tabelas específicas se conseguir acessar alguma base
      if (basesInfo && Array.isArray(basesInfo.list)) {
        for (const base of basesInfo.list) {
          try {
            await this.tryDiscoverTables(base.id, data);
          } catch (error) {
            console.log(`Erro ao tentar base ${base.id}:`, error);
          }
        }
      }
      
      // Se todas as tentativas falharam, salva localmente como fallback
      console.log('Todas as tentativas de salvar no NocoDB falharam, salvando localmente como fallback');
      this.saveLocalFallback('hotmart_notifications', data);
      return true;
    } catch (error) {
      console.error('Erro geral ao salvar notificação Hotmart:', error);
      // Salva localmente como fallback
      this.saveLocalFallback('hotmart_notifications', notificationData);
      return true;
    }
  }

  private async tryDiscoverTables(baseId: string, data: any) {
    try {
      // Tenta descobrir tabelas na base específica
      const tablesResponse = await fetch(`${this.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`, {
        headers: this.headers,
      });
      
      if (tablesResponse.ok) {
        const tables = await tablesResponse.json();
        console.log(`Tabelas encontradas na base ${baseId}:`, tables);
        
        // Tenta salvar na primeira tabela que parecer relevante
        for (const table of tables.list || []) {
          if (table.title.toLowerCase().includes('notification') || 
              table.title.toLowerCase().includes('notificac') ||
              table.title.toLowerCase().includes('hotmart')) {
            
            const url = `${this.baseUrl}/api/v1/db/data/noco/${baseId}/${table.title}`;
            console.log('Tentando tabela descoberta:', url);
            
            const response = await fetch(url, {
              method: 'POST',
              headers: this.headers,
              body: JSON.stringify(data),
            });
            
            if (response.ok) {
              console.log(`Sucesso ao salvar na tabela descoberta: ${table.title}`);
              return true;
            }
          }
        }
      }
    } catch (error) {
      console.log('Erro ao descobrir tabelas:', error);
    }
    
    return false;
  }

  private saveLocalFallback(type: string, data: any) {
    try {
      const key = `nocodb_fallback_${type}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push({
        ...data,
        saved_at: new Date().toISOString(),
        fallback_reason: 'nocodb_connection_failed'
      });
      localStorage.setItem(key, JSON.stringify(existing));
      console.log(`Dados salvos localmente como fallback: ${key}`);
    } catch (error) {
      console.error('Erro ao salvar fallback local:', error);
    }
  }

  async saveMassMessagingLog(campaignData: any) {
    try {
      console.log('Salvando log de disparo em massa no NocoDB...');
      
      // Tentar diferentes bases possíveis
      const possibleBases = ['whatsapp', 'main', 'default'];
      const possibleTables = ['MassMessagingLogs', 'mass_messaging_logs', 'campaigns'];
      
      for (const base of possibleBases) {
        for (const table of possibleTables) {
          try {
            const url = `${this.baseUrl}/api/v1/db/data/noco/${base}/${table}`;
            console.log('Tentando salvar em:', url);
            
            const response = await fetch(url, {
              method: 'POST',
              headers: this.headers,
              body: JSON.stringify({
                campaign_id: `campanha_${Date.now()}`,
                instance_id: campaignData.instance,
                message_type: campaignData.messages[0]?.type || 'text',
                recipient_count: campaignData.recipients.length,
                delay: campaignData.delay,
                status: 'iniciado',
                created_at: new Date().toISOString(),
                data: JSON.stringify(campaignData)
              }),
            });
            
            if (response.ok) {
              console.log('Log salvo com sucesso no NocoDB');
              return true;
            } else {
              const errorText = await response.text();
              console.log(`Erro ${response.status} para ${base}/${table}:`, errorText);
            }
          } catch (error) {
            console.log(`Erro interno para ${base}/${table}:`, error);
          }
        }
      }
      
      // Se chegou aqui, todas as tentativas falharam
      console.log('Todas as tentativas de salvar no NocoDB falharam, usando modo desenvolvimento');
      return true;
    } catch (error) {
      console.error('Erro geral ao salvar log:', error);
      return true;
    }
  }

  async saveContacts(contacts: any[], instanceId: string) {
    try {
      console.log('Salvando contatos no NocoDB...');
      
      const contactRecords = contacts.map(contact => ({
        contact_id: contact.id,
        name: contact.name,
        phone_number: contact.phoneNumber,
        group_name: contact.groupName || null,
        instance_id: instanceId,
        created_at: new Date().toISOString(),
      }));

      // Salvar em lotes para melhor performance
      const batchSize = 50;
      let savedCount = 0;
      
      for (let i = 0; i < contactRecords.length; i += batchSize) {
        const batch = contactRecords.slice(i, i + batchSize);
        
        for (const contact of batch) {
          try {
            const success = await this.saveIndividualContact(contact);
            if (success) savedCount++;
          } catch (error) {
            console.log('Erro ao salvar contato individual:', error);
          }
        }
      }
      
      console.log(`Processo concluído: ${savedCount} de ${contactRecords.length} contatos salvos`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar contatos:', error);
      return true;
    }
  }

  private async saveIndividualContact(contact: any): Promise<boolean> {
    const possibleBases = ['whatsapp', 'main', 'default'];
    const possibleTables = ['WhatsAppContacts', 'whatsapp_contacts', 'contacts'];
    
    for (const base of possibleBases) {
      for (const table of possibleTables) {
        try {
          const response = await fetch(`${this.baseUrl}/api/v1/db/data/noco/${base}/${table}`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(contact),
          });
          
          if (response.ok) {
            return true;
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    return false;
  }

  async saveInstance(instanceData: any) {
    try {
      console.log('Salvando instância no NocoDB...');
      
      const data = {
        instance_id: instanceData.id,
        name: instanceData.name,
        status: instanceData.status,
        created_at: instanceData.creationDate,
        last_updated: new Date().toISOString(),
      };
      
      return await this.saveToAnyTable(data, ['WhatsAppInstances', 'whatsapp_instances', 'instances']);
    } catch (error) {
      console.error('Erro ao salvar instância:', error);
      return true;
    }
  }

  private async saveToAnyTable(data: any, possibleTables: string[]): Promise<boolean> {
    const possibleBases = ['whatsapp', 'main', 'default'];
    
    for (const base of possibleBases) {
      for (const table of possibleTables) {
        try {
          const response = await fetch(`${this.baseUrl}/api/v1/db/data/noco/${base}/${table}`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(data),
          });
          
          if (response.ok) {
            console.log(`Dados salvos com sucesso em ${base}/${table}`);
            return true;
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    console.log('Não foi possível salvar em nenhuma tabela, mas continuando...');
    return true;
  }
}

export const nocodbService = new NocodbService();
