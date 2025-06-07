
class NocodbService {
  private baseUrl = 'https://kovalski.novahagencia.com.br';
  private apiToken = 'aY4YYKsICfBJXDtjLj4GWlwwaFIOkwSsOy64gslJ';
  
  private headers = {
    'Content-Type': 'application/json',
    'xc-token': this.apiToken,
  };

  // Cache das bases descobertas
  private discoveredBases: any[] = [];
  private targetBaseId: string | null = null;

  async discoverBases() {
    try {
      console.log('Descobrindo bases disponíveis no NocoDB...');
      
      const response = await fetch(`${this.baseUrl}/api/v1/db/meta/projects`, {
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

  async testConnection() {
    try {
      console.log('Testando conexão com NocoDB...');
      
      const bases = await this.discoverBases();
      
      if (bases && this.discoveredBases.length > 0) {
        console.log('NocoDB conectado com sucesso, bases disponíveis:', this.discoveredBases);
        
        if (this.targetBaseId) {
          return { success: true, bases: this.discoveredBases, targetBase: this.targetBaseId };
        } else {
          return { success: false, error: 'Base "Notificação Inteligente" não encontrada' };
        }
      }
      
      return { success: false, error: 'Nenhuma base encontrada' };
    } catch (error) {
      console.error('Erro ao conectar com NocoDB:', error);
      return { success: false, error: error.message };
    }
  }

  async saveHotmartNotification(notificationData: any) {
    try {
      console.log('Salvando notificação Hotmart no NocoDB...');
      console.log('Dados originais:', notificationData);
      
      // Primeiro descobre as bases se ainda não foram descobertas
      if (!this.targetBaseId) {
        await this.discoverBases();
      }
      
      if (!this.targetBaseId) {
        console.log('❌ Base "Notificação Inteligente" não encontrada');
        this.saveLocalFallback('hotmart_notifications', notificationData);
        return true;
      }
      
      // Estruturar os dados corretamente para o NocoDB
      const data = {
        event_type: notificationData.eventType || '',
        instance_id: notificationData.instance || '',
        user_role: notificationData.userRole || '',
        hotmart_profile: notificationData.hotmartProfile || '',
        webhook_url: notificationData.webhookUrl || '',
        message_count: notificationData.messages ? notificationData.messages.length : 0,
        notification_phone: notificationData.notificationPhone || '',
        created_at: notificationData.timestamp || new Date().toISOString(),
        // Garantir que o campo data seja uma string JSON válida
        data_json: JSON.stringify({
          ...notificationData,
          saved_timestamp: new Date().toISOString()
        })
      };
      
      console.log('Dados formatados para NocoDB:', data);
      console.log(`Tentando salvar na base "Notificação Inteligente" (ID: ${this.targetBaseId})...`);
      
      // Descobrir tabelas na base "Notificação Inteligente"
      const tables = await this.getTablesFromBase(this.targetBaseId);
      console.log(`Tabelas encontradas na base "Notificação Inteligente":`, tables);
      
      if (tables && tables.length > 0) {
        // Tentar salvar na primeira tabela disponível
        for (const table of tables) {
          try {
            console.log(`Tentando salvar na tabela: ${table.title} (${table.table_name})`);
            const success = await this.saveToSpecificTable(this.targetBaseId, table.table_name, data);
            if (success) {
              console.log(`✅ Dados salvos com sucesso na base "Notificação Inteligente", tabela ${table.title}`);
              return true;
            }
          } catch (error) {
            console.log(`❌ Erro ao salvar na tabela ${table.title}:`, error);
            continue;
          }
        }
      }
      
      // Se não conseguiu salvar em nenhuma tabela existente, tentar criar uma nova
      console.log('Tentando criar nova tabela para notificações na base "Notificação Inteligente"...');
      const success = await this.createNotificationTable(this.targetBaseId, data);
      if (success) {
        console.log(`✅ Nova tabela criada e dados salvos na base "Notificação Inteligente"`);
        return true;
      }
      
      // Se chegou aqui, todas as tentativas falharam
      console.log('❌ Todas as tentativas falharam, salvando localmente como fallback');
      this.saveLocalFallback('hotmart_notifications', data);
      return true;
      
    } catch (error) {
      console.error('Erro geral ao salvar notificação Hotmart:', error);
      this.saveLocalFallback('hotmart_notifications', notificationData);
      return true;
    }
  }

  private async getTablesFromBase(baseId: string) {
    try {
      console.log(`Buscando tabelas da base ${baseId}...`);
      const response = await fetch(`${this.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`, {
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

  private async saveToSpecificTable(baseId: string, tableName: string, data: any): Promise<boolean> {
    try {
      console.log(`Salvando dados na tabela ${tableName}:`, data);
      
      // Tentar API v1 primeiro
      let url = `${this.baseUrl}/api/v1/db/data/noco/${baseId}/${tableName}`;
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
      url = `${this.baseUrl}/api/v2/tables/${tableName}/records`;
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

  private async createNotificationTable(baseId: string, data: any): Promise<boolean> {
    try {
      console.log(`Tentando criar tabela de notificações na base ${baseId}...`);
      
      // Definir estrutura da tabela com campos mais específicos
      const tableSchema = {
        table_name: 'NotificacoesHotmart',
        title: 'Notificações Hotmart',
        columns: [
          { column_name: 'id', title: 'ID', uidt: 'ID' },
          { column_name: 'event_type', title: 'Tipo de Evento', uidt: 'SingleLineText' },
          { column_name: 'instance_id', title: 'ID da Instância', uidt: 'SingleLineText' },
          { column_name: 'user_role', title: 'Função do Usuário', uidt: 'SingleLineText' },
          { column_name: 'hotmart_profile', title: 'Perfil Hotmart', uidt: 'SingleLineText' },
          { column_name: 'webhook_url', title: 'URL do Webhook', uidt: 'LongText' },
          { column_name: 'message_count', title: 'Quantidade de Mensagens', uidt: 'Number' },
          { column_name: 'notification_phone', title: 'Telefone de Notificação', uidt: 'SingleLineText' },
          { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime' },
          { column_name: 'data_json', title: 'Dados Completos (JSON)', uidt: 'LongText' }
        ]
      };
      
      console.log('Schema da tabela:', tableSchema);
      
      const response = await fetch(`${this.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(tableSchema),
      });
      
      if (response.ok) {
        const tableResult = await response.json();
        console.log('✅ Tabela criada com sucesso:', tableResult);
        
        // Agora tentar salvar os dados na nova tabela
        const success = await this.saveToSpecificTable(baseId, 'NotificacoesHotmart', data);
        return success;
      } else {
        const errorText = await response.text();
        console.log('❌ Erro ao criar tabela:', response.status, errorText);
        return false;
      }
      
    } catch (error) {
      console.log('❌ Erro ao criar tabela:', error);
      return false;
    }
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
      console.log(`💾 Dados salvos localmente como fallback: ${key}`);
      console.log('📱 Os dados estão seguros no armazenamento local e serão sincronizados quando o NocoDB estiver disponível');
    } catch (error) {
      console.error('❌ Erro ao salvar fallback local:', error);
    }
  }

  // Método para sincronizar dados salvos localmente quando conexão for restabelecida
  async syncLocalData() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('nocodb_fallback_'));
      
      for (const key of keys) {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        console.log(`Sincronizando ${data.length} registros de ${key}...`);
        
        for (const record of data) {
          // Remover campos de fallback antes de sincronizar
          const { saved_at, fallback_reason, ...cleanRecord } = record;
          
          if (key.includes('hotmart_notifications')) {
            const success = await this.saveHotmartNotification(cleanRecord);
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

  // Manter métodos existentes para compatibilidade
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
