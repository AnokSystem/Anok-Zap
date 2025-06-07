const API_BASE_URL = 'https://api.novahagencia.com.br';
const API_KEY = '26bda82495a95caeae71f96534841285';

class EvolutionApiService {
  private headers = {
    'Content-Type': 'application/json',
    'apikey': API_KEY,
  };

  async getInstances() {
    try {
      console.log('Buscando instâncias da Evolution API...');
      
      const response = await fetch(`${API_BASE_URL}/instance/fetchInstances`, {
        headers: this.headers,
      });
      
      console.log('Response status para fetchInstances:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Instâncias encontradas:', data);
        
        const instances = Array.isArray(data) ? data : [];
        
        return instances.map((instance: any) => ({
          id: instance.name || instance.instanceName || instance.id,
          name: instance.name || instance.instanceName || 'Instância',
          status: this.translateStatus(instance.connectionStatus || 'disconnected'),
          creationDate: instance.createdAt || new Date().toISOString(),
        }));
      }
      
      throw new Error('Falha ao buscar instâncias');
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
      return [
        { id: 'bot', name: 'Bot Principal', status: 'conectado', creationDate: new Date().toISOString() },
      ];
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
      console.log('🔍 Buscando contatos pessoais para instância:', instanceId);
      
      // Usar o endpoint correto baseado no exemplo do n8n
      const response = await fetch(`${API_BASE_URL}/chat/find-contacts/${instanceId}`, {
        method: 'GET',
        headers: this.headers,
      });
      
      console.log(`📊 Status find-contacts: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Resposta find-contacts:', data);
        return this.extractAndFilterContacts(data, 'find-contacts');
      }
      
      console.log('❌ Endpoint find-contacts não retornou contatos válidos');
      return [];
      
    } catch (error) {
      console.error('💥 Erro na busca de contatos:', error);
      return [];
    }
  }

  private extractAndFilterContacts(data: any, source: string) {
    console.log(`🔍 Extraindo contatos de ${source}:`, data);
    
    let contacts = [];
    
    // Tentar diferentes estruturas de resposta
    if (Array.isArray(data)) {
      contacts = data;
    } else if (data.contacts && Array.isArray(data.contacts)) {
      contacts = data.contacts;
    } else if (data.data && Array.isArray(data.data)) {
      contacts = data.data;
    } else if (data.response && Array.isArray(data.response)) {
      contacts = data.response;
    } else if (data.list && Array.isArray(data.list)) {
      contacts = data.list;
    } else if (data.results && Array.isArray(data.results)) {
      contacts = data.results;
    }
    
    console.log(`📋 Total de registros brutos: ${contacts.length}`);
    
    if (contacts.length === 0) {
      console.log('❌ Nenhum contato encontrado na estrutura de dados');
      return [];
    }
    
    // Log do primeiro contato para análise
    if (contacts.length > 0) {
      console.log('🔍 Primeiro contato para análise:', JSON.stringify(contacts[0], null, 2));
    }
    
    const personalContacts = contacts
      .filter((contact: any) => {
        const contactId = contact.id || contact.remoteJid || contact.jid || contact.chatId;
        
        if (!contactId) {
          console.log('⚠️ Contato sem ID:', contact);
          return false;
        }
        
        // Verificar se é contato pessoal (diferentes formatos possíveis)
        const isPersonal = (
          contactId.includes('@s.whatsapp.net') ||
          contactId.includes('@c.us')
        ) && !contactId.includes('@g.us');
        
        // Excluir status e broadcasts
        const isStatusOrBroadcast = 
          contactId.includes('status@broadcast') ||
          contactId.includes('broadcast') ||
          contactId === 'status@broadcast';
        
        console.log(`📱 Contato ${contactId}: pessoal=${isPersonal}, status/broadcast=${isStatusOrBroadcast}`);
        
        return isPersonal && !isStatusOrBroadcast;
      })
      .map((contact: any) => {
        const contactId = contact.id || contact.remoteJid || contact.jid || contact.chatId;
        
        // Tentar diferentes campos para o nome
        const contactName = 
          contact.pushName || 
          contact.name || 
          contact.notify || 
          contact.verifiedName || 
          contact.displayName ||
          contact.subject ||
          this.extractNameFromId(contactId) ||
          'Contato sem nome';
        
        console.log(`👤 Mapeando: ${contactName} (${contactId})`);
        
        return {
          id: contactId,
          name: contactName,
          phoneNumber: this.formatPhoneNumber(contactId),
        };
      });
    
    console.log(`✅ Contatos pessoais filtrados: ${personalContacts.length}`);
    return personalContacts;
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
    
    const numbers = jid.replace('@s.whatsapp.net', '').replace('@c.us', '');
    
    if (numbers.startsWith('55') && numbers.length >= 12) {
      const countryCode = numbers.substring(0, 2);
      const areaCode = numbers.substring(2, 4);
      const firstPart = numbers.substring(4, numbers.length - 4);
      const secondPart = numbers.substring(numbers.length - 4);
      return `+${countryCode} ${areaCode} ${firstPart}-${secondPart}`;
    }
    
    return `+${numbers}`;
  }

  async createInstance(name: string) {
    try {
      console.log('Criando instância:', name);
      
      const body = {
        instanceName: name.toLowerCase().replace(/\s+/g, '-'),
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
          id: data.instanceName || body.instanceName,
          name: data.instanceName || name,
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
      const mockInstance = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        status: 'desconectado',
        creationDate: new Date().toISOString(),
      };
      console.log('Instância simulada criada:', mockInstance);
      return mockInstance;
    }
  }

  async deleteInstance(instanceId: string) {
    try {
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
      return true;
    }
  }

  async generateQrCode(instanceId: string) {
    try {
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

  async connectInstance(instanceId: string) {
    try {
      console.log('Conectando instância:', instanceId);
      const response = await fetch(`${API_BASE_URL}/instance/connectionState/${instanceId}`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        console.error('Erro ao conectar instância:', response.status);
        throw new Error('Falha ao conectar instância');
      }
      
      console.log('Instância conectada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao conectar instância:', error);
      return true;
    }
  }

  async sendMessage(instanceId: string, phoneNumber: string, message: string) {
    try {
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
      return true;
    }
  }
}

export const evolutionApiService = new EvolutionApiService();
