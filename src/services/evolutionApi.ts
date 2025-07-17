
const API_BASE_URL = 'https://api.anok.com.br';
const API_KEY = 'ANOKAPI0209';

class EvolutionApiService {
  private headers = {
    'Content-Type': 'application/json',
    'apikey': API_KEY,
  };

  private getUserId(): string | null {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        return user.ID;
      }
    } catch (error) {
      console.error('Erro ao obter ID do usuário:', error);
    }
    return null;
  }

  private formatInstanceName(name: string, userId: string): string {
    return `${name}-user-${userId}`.toLowerCase().replace(/\s+/g, '-');
  }

  private extractOriginalName(instanceName: string, userId: string): string {
    // Extrair o nome original removendo o sufixo "-user-{userId}"
    const suffix = `-user-${userId}`;
    if (instanceName.endsWith(suffix)) {
      return instanceName.slice(0, -suffix.length);
    }
    return instanceName;
  }

  private isUserInstance(instanceName: string, userId: string): boolean {
    return instanceName.includes(`user-${userId}`);
  }

  async getInstances() {
    try {
      console.log('Buscando instâncias da Evolution API...');
      
      const userId = this.getUserId();
      if (!userId) {
        console.log('Usuário não autenticado');
        return [];
      }
      
      const response = await fetch(`${API_BASE_URL}/instance/fetchInstances`, {
        headers: this.headers,
      });
      
      console.log('Response status para fetchInstances:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Todas as instâncias encontradas:', data);
        
        const instances = Array.isArray(data) ? data : [];
        
        // Filtrar apenas instâncias do usuário atual
        const userInstances = instances.filter(instance => {
          const instanceName = instance.name || instance.instanceName || instance.id;
          return this.isUserInstance(instanceName, userId);
        });
        
        console.log(`Instâncias do usuário ${userId}:`, userInstances);
        
        return userInstances.map((instance: any) => {
          const instanceId = instance.name || instance.instanceName || instance.id;
          const originalName = this.extractOriginalName(instanceId, userId);
          
          return {
            id: instanceId,
            name: originalName, // Mostrar o nome original sem o sufixo
            status: this.translateStatus(instance.connectionStatus || 'disconnected'),
            creationDate: instance.createdAt || new Date().toISOString(),
          };
        });
      }
      
      throw new Error('Falha ao buscar instâncias');
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
      // Retornar array vazio em caso de erro para usuários autenticados
      return [];
    }
  }

  private translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'open': 'conectado',
      'close': 'desconectado',
      'connecting': 'conectando',
    };
    return statusMap[status.toLowerCase()] || status;
  }

  async getGroups(instanceId: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        console.log('Acesso negado à instância:', instanceId);
        return [];
      }

      console.log('Buscando grupos para instância:', instanceId);
      
      const response = await fetch(`${API_BASE_URL}/group/fetchAllGroups/${instanceId}?getParticipants=false`, {
        headers: this.headers,
      });
      
      console.log(`Response status para fetchAllGroups: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Grupos encontrados:', data);
        
        const groups = Array.isArray(data) ? data : data.groups || data.data || [];
        
        return groups.map((group: any) => ({
          id: group.id || group.remoteJid,
          name: group.subject || group.name || 'Grupo sem nome',
        }));
      }
      
      throw new Error('Falha ao buscar grupos');
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      return [];
    }
  }

  async getAllContacts(instanceId: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        console.log('Acesso negado à instância:', instanceId);
        return [];
      }

      console.log('🔍 Iniciando busca de contatos pessoais para instância:', instanceId);
      
      // Adicionar timeout para evitar travamento
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('⏰ Timeout na busca de contatos - cancelando requisição');
      }, 30000); // 30 segundos
      
      const response = await fetch(`${API_BASE_URL}/chat/findContacts/${instanceId}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({}),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`📊 Status findContacts: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta da API:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📦 Resposta findContacts (primeiros 3 itens):', data.slice ? data.slice(0, 3) : data);
      console.log('📦 Tipo da resposta:', typeof data, 'É array:', Array.isArray(data));
      
      // Tentar diferentes formatos de resposta
      let contacts = [];
      if (Array.isArray(data)) {
        contacts = data;
      } else if (data.contacts && Array.isArray(data.contacts)) {
        contacts = data.contacts;
      } else if (data.data && Array.isArray(data.data)) {
        contacts = data.data;
      } else if (data.list && Array.isArray(data.list)) {
        contacts = data.list;
      } else {
        console.log('❌ Formato de resposta não reconhecido:', data);
        return [];
      }
      
      console.log(`📋 Total de contatos brutos encontrados: ${contacts.length}`);
      
      if (contacts.length === 0) {
        console.log('❌ Nenhum contato encontrado na resposta da API');
        return [];
      }
      
      // Log dos primeiros contatos para debug
      console.log('🔍 Primeiros 3 contatos brutos:', contacts.slice(0, 3));
      
      const personalContacts = contacts
        .filter((contact: any, index: number) => {
          const contactId = contact.remoteJid || contact.id || contact.jid;
          
          if (!contactId) {
            if (index < 5) console.log(`❌ Contato sem ID no índice ${index}:`, contact);
            return false;
          }
          
          // Filtrar apenas contatos pessoais (mais flexível)
          const isPersonal = contactId.includes('@s.whatsapp.net') || contactId.includes('@c.us');
          const isNotGroup = !contactId.includes('@g.us');
          const isNotBroadcast = !contactId.includes('status@broadcast') && !contactId.includes('broadcast');
          
          const isValid = isPersonal && isNotGroup && isNotBroadcast;
          
          if (index < 5) {
            console.log(`🔍 Contato ${index}:`, {
              contactId,
              isPersonal,
              isNotGroup,
              isNotBroadcast,
              isValid
            });
          }
          
          return isValid;
        })
        .map((contact: any, index: number) => {
          const contactId = contact.remoteJid || contact.id || contact.jid;
          
          // Tentar extrair nome de várias propriedades possíveis
          const contactName = 
            contact.pushName || 
            contact.name || 
            contact.notify || 
            contact.displayName ||
            contact.verifiedName ||
            this.extractNameFromId(contactId) ||
            'Contato sem nome';
          
          const formattedContact = {
            id: contactId,
            name: contactName,
            phoneNumber: this.formatPhoneNumber(contactId),
          };
          
          if (index < 5) {
            console.log(`📞 Contato formatado ${index}:`, formattedContact);
          }
          
          return formattedContact;
        });
      
      console.log(`✅ Total de contatos pessoais filtrados: ${personalContacts.length}`);
      
      // Remover duplicatas baseado no número de telefone
      const uniqueContacts = personalContacts.filter((contact, index, self) => 
        index === self.findIndex(c => c.phoneNumber === contact.phoneNumber)
      );
      
      console.log(`✅ Contatos únicos após remoção de duplicatas: ${uniqueContacts.length}`);
      
      return uniqueContacts;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('⏰ Busca de contatos cancelada por timeout');
        throw new Error('Timeout na busca de contatos. Tente novamente.');
      }
      console.error('💥 Erro na busca de contatos:', error);
      throw error;
    }
  }

  private extractNameFromId(contactId: string): string | null {
    try {
      // Extrair número do ID e usar como nome de fallback
      const number = contactId.replace('@s.whatsapp.net', '').replace('@c.us', '');
      if (number && number.length > 5) {
        return `+${number}`;
      }
    } catch (error) {
      console.log('Erro ao extrair nome do ID:', error);
    }
    return null;
  }

  async getGroupContacts(instanceId: string, groupId: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        console.log('Acesso negado à instância:', instanceId);
        return [];
      }

      console.log('Buscando participantes do grupo:', groupId);
      
      const response = await fetch(`${API_BASE_URL}/group/participants/${instanceId}?groupJid=${groupId}`, {
        headers: this.headers,
      });
      
      console.log(`Response status para group participants: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Participantes encontrados:', data);
        
        const participants = Array.isArray(data) ? data : data.participants || data.data || [];
        
        let groupName = 'Grupo';
        try {
          const groupInfoResponse = await fetch(`${API_BASE_URL}/group/findGroup/${instanceId}?groupJid=${groupId}`, {
            headers: this.headers,
          });
          if (groupInfoResponse.ok) {
            const groupInfo = await groupInfoResponse.json();
            groupName = groupInfo.subject || groupInfo.name || 'Grupo';
          }
        } catch (error) {
          console.log('Erro ao buscar info do grupo:', error);
        }
        
        return participants.map((participant: any) => ({
          id: participant.id || participant.jid,
          name: participant.notify || participant.name || participant.pushName || 'Participante',
          phoneNumber: this.formatPhoneNumber(participant.id || participant.jid),
          groupName: groupName,
          isAdmin: participant.admin === 'admin' || participant.isAdmin === true,
        }));
      }
      
      throw new Error('Falha ao buscar participantes do grupo');
    } catch (error) {
      console.error('Erro ao buscar participantes do grupo:', error);
      return [];
    }
  }

  private formatPhoneNumber(jid: string): string {
    if (!jid) return '';
    
    // Extrair apenas os números, removendo @s.whatsapp.net e @c.us
    const numbers = jid.replace('@s.whatsapp.net', '').replace('@c.us', '');
    
    // Retornar apenas os números, sem formatação
    return numbers;
  }

  async createInstance(name: string) {
    try {
      const userId = this.getUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const instanceName = this.formatInstanceName(name, userId);
      console.log('Criando instância:', instanceName);
      
      const body = {
        instanceName: instanceName,
        integration: 'WHATSAPP-BAILEYS',
        webhookUrl: 'https://webhook.novahagencia.com.br/webhook/bb39433b-a53b-484c-8721-f9a66d54f821'
      };
      
      const response = await fetch(`${API_BASE_URL}/instance/create`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Instância criada com sucesso:', data);
        
        return {
          id: data.instanceName || instanceName,
          name: name, // Retornar o nome original para exibição
          status: 'desconectado',
          creationDate: new Date().toISOString(),
        };
      } else {
        const errorData = await response.text();
        console.error('Erro na criação:', response.status, errorData);
        throw new Error(`Erro ${response.status}: ${errorData}`);
      }
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      throw error;
    }
  }

  async deleteInstance(instanceId: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      console.log('Excluindo instância:', instanceId);
      const response = await fetch(`${API_BASE_URL}/instance/delete/${instanceId}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      
      if (!response.ok) {
        console.error('Erro ao excluir instância:', response.status);
        throw new Error('Falha ao excluir instância');
      }
      
      console.log('Instância excluída com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao excluir instância:', error);
      throw error;
    }
  }

  async disconnectInstance(instanceId: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      console.log('🔄 Desconectando instância:', instanceId);
      
      const response = await fetch(`${API_BASE_URL}/instance/logout/${instanceId}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      
      console.log(`📊 Status logout: ${response.status}`);
      
      if (response.ok) {
        console.log('✅ Instância desconectada com sucesso');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao desconectar instância:', response.status, errorText);
        throw new Error(`Erro ${response.status}: Falha ao desconectar instância`);
      }
    } catch (error) {
      console.error('💥 Erro geral ao desconectar instância:', error);
      throw error;
    }
  }

  async connectInstance(instanceId: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      console.log('🔄 Conectando instância:', instanceId);
      
      const response = await fetch(`${API_BASE_URL}/instance/connect/${instanceId}`, {
        method: 'GET',
        headers: this.headers,
      });
      
      console.log(`📊 Status connect: ${response.status}`);
      
      if (response.ok) {
        console.log('✅ Instância conectada com sucesso');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao conectar instância:', response.status, errorText);
        throw new Error(`Erro ${response.status}: Falha ao conectar instância`);
      }
    } catch (error) {
      console.error('💥 Erro geral ao conectar instância:', error);
      throw error;
    }
  }

  async generateQrCode(instanceId: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      console.log('Gerando QR code para instância:', instanceId);
      
      const response = await fetch(`${API_BASE_URL}/instance/connect/${instanceId}`, {
        headers: this.headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('QR code gerado:', data);
        return data.qrcode || data.base64 || data.qr || this.generateMockQR();
      }
      
      return this.generateMockQR();
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
      return this.generateMockQR();
    }
  }

  private generateMockQR(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = '#FFFFFF';
      
      for (let i = 0; i < 32; i++) {
        for (let j = 0; j < 32; j++) {
          if ((i + j) % 3 === 0) {
            ctx.fillRect(i * 8, j * 8, 8, 8);
          }
        }
      }
      
      return canvas.toDataURL();
    }
    
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  async sendMessage(instanceId: string, phoneNumber: string, message: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      console.log('Enviando mensagem:', { instanceId, phoneNumber, message });
      const response = await fetch(`${API_BASE_URL}/message/sendText/${instanceId}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          number: phoneNumber,
          text: message,
        }),
      });
      
      if (!response.ok) {
        console.error('Erro ao enviar mensagem:', response.status);
        throw new Error('Falha ao enviar mensagem');
      }
      
      console.log('Mensagem enviada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }
}

export const evolutionApiService = new EvolutionApiService();
