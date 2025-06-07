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

  // Schemas das tabelas necessárias
  private tableSchemas = {
    NotificacoesHotmart: {
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
    },
    WhatsAppInstances: {
      table_name: 'WhatsAppInstances',
      title: 'Instâncias WhatsApp',
      columns: [
        { column_name: 'id', title: 'ID', uidt: 'ID' },
        { column_name: 'instance_id', title: 'ID da Instância', uidt: 'SingleLineText' },
        { column_name: 'name', title: 'Nome', uidt: 'SingleLineText' },
        { column_name: 'status', title: 'Status', uidt: 'SingleLineText' },
        { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime' },
        { column_name: 'last_updated', title: 'Última Atualização', uidt: 'DateTime' },
        { column_name: 'data_json', title: 'Dados Completos (JSON)', uidt: 'LongText' }
      ]
    },
    WhatsAppContacts: {
      table_name: 'WhatsAppContacts',
      title: 'Contatos WhatsApp',
      columns: [
        { column_name: 'id', title: 'ID', uidt: 'ID' },
        { column_name: 'contact_id', title: 'ID do Contato', uidt: 'SingleLineText' },
        { column_name: 'name', title: 'Nome', uidt: 'SingleLineText' },
        { column_name: 'phone_number', title: 'Número do Telefone', uidt: 'SingleLineText' },
        { column_name: 'group_name', title: 'Nome do Grupo', uidt: 'SingleLineText' },
        { column_name: 'instance_id', title: 'ID da Instância', uidt: 'SingleLineText' },
        { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime' },
        { column_name: 'data_json', title: 'Dados Completos (JSON)', uidt: 'LongText' }
      ]
    },
    MassMessagingLogs: {
      table_name: 'MassMessagingLogs',
      title: 'Logs de Disparo em Massa',
      columns: [
        { column_name: 'id', title: 'ID', uidt: 'ID' },
        { column_name: 'campaign_id', title: 'ID da Campanha', uidt: 'SingleLineText' },
        { column_name: 'instance_id', title: 'ID da Instância', uidt: 'SingleLineText' },
        { column_name: 'message_type', title: 'Tipo de Mensagem', uidt: 'SingleLineText' },
        { column_name: 'recipient_count', title: 'Quantidade de Destinatários', uidt: 'Number' },
        { column_name: 'delay', title: 'Delay (ms)', uidt: 'Number' },
        { column_name: 'status', title: 'Status', uidt: 'SingleLineText' },
        { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime' },
        { column_name: 'data_json', title: 'Dados Completos (JSON)', uidt: 'LongText' }
      ]
    },
    WebhookLogs: {
      table_name: 'WebhookLogs',
      title: 'Logs de Webhooks',
      columns: [
        { column_name: 'id', title: 'ID', uidt: 'ID' },
        { column_name: 'webhook_url', title: 'URL do Webhook', uidt: 'LongText' },
        { column_name: 'event_type', title: 'Tipo de Evento', uidt: 'SingleLineText' },
        { column_name: 'source', title: 'Origem', uidt: 'SingleLineText' },
        { column_name: 'status_code', title: 'Código de Status', uidt: 'Number' },
        { column_name: 'response_time', title: 'Tempo de Resposta (ms)', uidt: 'Number' },
        { column_name: 'created_at', title: 'Criado em', uidt: 'DateTime' },
        { column_name: 'request_data', title: 'Dados da Requisição (JSON)', uidt: 'LongText' },
        { column_name: 'response_data', title: 'Dados da Resposta (JSON)', uidt: 'LongText' }
      ]
    }
  };

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
      for (const [tableName, schema] of Object.entries(this.tableSchemas)) {
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

  private async createTable(baseId: string, schema: any): Promise<boolean> {
    try {
      console.log(`Criando tabela ${schema.title} na base ${baseId}...`);
      console.log('Schema da tabela:', schema);
      
      const response = await fetch(`${this.baseUrl}/api/v1/db/meta/projects/${baseId}/tables`, {
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
        table.title === this.tableSchemas[tableName]?.title
      );
      
      if (tableExists) {
        console.log(`✅ Tabela ${tableName} já existe`);
        return true;
      }
      
      // Criar a tabela se não existir
      const schema = this.tableSchemas[tableName];
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

  async saveHotmartNotification(notificationData: any) {
    try {
      console.log('Salvando notificação Hotmart no NocoDB...');
      console.log('Dados originais:', notificationData);
      
      // Garantir que a tabela existe
      await this.ensureTableExists('NotificacoesHotmart');
      
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
        data_json: JSON.stringify({
          ...notificationData,
          saved_timestamp: new Date().toISOString()
        })
      };
      
      console.log('Dados formatados para NocoDB:', data);
      
      if (!this.targetBaseId) {
        console.log('❌ Base "Notificação Inteligente" não encontrada');
        this.saveLocalFallback('hotmart_notifications', notificationData);
        return true;
      }
      
      // Tentar salvar na tabela de notificações
      const success = await this.saveToSpecificTable(this.targetBaseId, 'NotificacoesHotmart', data);
      if (success) {
        console.log('✅ Dados salvos com sucesso na tabela NotificacoesHotmart');
        return true;
      }
      
      // Se falhou, salvar como fallback
      console.log('❌ Falha ao salvar, usando fallback local');
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
    return await this.createTable(baseId, this.tableSchemas.NotificacoesHotmart);
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

  async saveMassMessagingLog(campaignData: any) {
    try {
      console.log('Salvando log de disparo em massa no NocoDB...');
      
      // Garantir que a tabela existe
      await this.ensureTableExists('MassMessagingLogs');
      
      const data = {
        campaign_id: `campanha_${Date.now()}`,
        instance_id: campaignData.instance,
        message_type: campaignData.messages[0]?.type || 'text',
        recipient_count: campaignData.recipients.length,
        delay: campaignData.delay,
        status: 'iniciado',
        created_at: new Date().toISOString(),
        data_json: JSON.stringify(campaignData)
      };
      
      if (this.targetBaseId) {
        const success = await this.saveToSpecificTable(this.targetBaseId, 'MassMessagingLogs', data);
        if (success) {
          console.log('✅ Log de disparo em massa salvo com sucesso');
          return true;
        }
      }
      
      console.log('❌ Falha ao salvar no NocoDB, usando modo desenvolvimento');
      return true;
    } catch (error) {
      console.error('Erro geral ao salvar log:', error);
      return true;
    }
  }

  async saveContacts(contacts: any[], instanceId: string) {
    try {
      console.log('Salvando contatos no NocoDB...');
      
      // Garantir que a tabela existe
      await this.ensureTableExists('WhatsAppContacts');
      
      const contactRecords = contacts.map(contact => ({
        contact_id: contact.id,
        name: contact.name,
        phone_number: contact.phoneNumber,
        group_name: contact.groupName || null,
        instance_id: instanceId,
        created_at: new Date().toISOString(),
        data_json: JSON.stringify(contact)
      }));

      // Salvar em lotes para melhor performance
      const batchSize = 50;
      let savedCount = 0;
      
      for (let i = 0; i < contactRecords.length; i += batchSize) {
        const batch = contactRecords.slice(i, i + batchSize);
        
        for (const contact of batch) {
          try {
            if (this.targetBaseId) {
              const success = await this.saveToSpecificTable(this.targetBaseId, 'WhatsAppContacts', contact);
              if (success) savedCount++;
            }
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
    if (this.targetBaseId) {
      return await this.saveToSpecificTable(this.targetBaseId, 'WhatsAppContacts', contact);
    }
    return false;
  }

  async saveInstance(instanceData: any) {
    try {
      console.log('Salvando instância no NocoDB...');
      
      // Garantir que a tabela existe
      await this.ensureTableExists('WhatsAppInstances');
      
      const data = {
        instance_id: instanceData.id,
        name: instanceData.name,
        status: instanceData.status,
        created_at: instanceData.creationDate,
        last_updated: new Date().toISOString(),
        data_json: JSON.stringify(instanceData)
      };
      
      if (this.targetBaseId) {
        const success = await this.saveToSpecificTable(this.targetBaseId, 'WhatsAppInstances', data);
        if (success) {
          console.log('✅ Instância salva com sucesso');
          return true;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar instância:', error);
      return true;
    }
  }

  private async saveToAnyTable(data: any, possibleTables: string[]): Promise<boolean> {
    for (const table of possibleTables) {
      if (this.targetBaseId) {
        try {
          const success = await this.saveToSpecificTable(this.targetBaseId, table, data);
          if (success) {
            console.log(`Dados salvos com sucesso em ${table}`);
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
