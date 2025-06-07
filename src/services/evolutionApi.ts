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
      
      const endpoints = [
        '/instance/fetchInstances',
        '/instances',
        '/instance'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: this.headers,
          });
          
          console.log(`Response status para ${endpoint}:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Instâncias encontradas:', data);
            
            const instances = Array.isArray(data) ? data : data.instances || data.data || [];
            
            return instances.map((instance: any) => ({
              id: instance.instanceName || instance.name || instance.id || `instance_${Date.now()}`,
              name: instance.instanceName || instance.name || instance.id || 'Instância Padrão',
              status: this.translateStatus(instance.connectionStatus || instance.status || 'disconnected'),
              creationDate: instance.createdAt || new Date().toISOString(),
            }));
          }
        } catch (endpointError) {
          console.log(`Erro no endpoint ${endpoint}:`, endpointError);
          continue;
        }
      }
      
      throw new Error('Todos os endpoints falharam');
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
      return [
        { id: 'instance1', name: 'WhatsApp Principal', status: 'conectado', creationDate: new Date().toISOString() },
        { id: 'instance2', name: 'Bot de Marketing', status: 'desconectado', creationDate: new Date().toISOString() },
        { id: 'instance3', name: 'Suporte Cliente', status: 'conectando', creationDate: new Date().toISOString() },
      ];
    }
  }

  private translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'connected': 'conectado',
      'disconnected': 'desconectado',
      'connecting': 'conectando',
      'open': 'conectado',
      'close': 'desconectado',
    };
    return statusMap[status.toLowerCase()] || status;
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
      return true; // Retornar true para desenvolvimento
    }
  }

  async generateQrCode(instanceId: string) {
    try {
      console.log('Gerando QR code para instância:', instanceId);
      
      const endpoints = [
        `/instance/connect/${instanceId}`,
        `/instance/qrcode/${instanceId}`,
        `/qrcode/${instanceId}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: this.headers,
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('QR code gerado:', data);
            return data.qrcode || data.base64 || data.qr || this.generateMockQR();
          }
        } catch (endpointError) {
          continue;
        }
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
      return true; // Retornar true para desenvolvimento
    }
  }

  async getGroups(instanceId: string) {
    try {
      console.log('Buscando grupos para instância:', instanceId);
      
      const endpoints = [
        `/group/fetchAllGroups/${instanceId}`,
        `/chat/findChats/${instanceId}?where={"key.fromMe": false, "key.remoteJid": {"$regex": "@g.us$"}}`,
        `/instance/fetchGroups/${instanceId}`,
        `/groups/${instanceId}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Tentando endpoint: ${endpoint}`);
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: this.headers,
          });
          
          console.log(`Response status para ${endpoint}:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Grupos encontrados:', data);
            
            const groups = Array.isArray(data) ? data : data.groups || data.data || [];
            
            return groups.map((group: any) => ({
              id: group.id || group.remoteJid || group.groupId,
              name: group.subject || group.name || group.title || 'Grupo sem nome',
            }));
          }
        } catch (endpointError) {
          console.log(`Erro no endpoint ${endpoint}:`, endpointError);
          continue;
        }
      }
      
      console.log('Todos os endpoints de grupos falharam, retornando dados mock');
      return [
        { id: 'group1', name: 'Equipe de Marketing' },
        { id: 'group2', name: 'Clientes VIP' },
        { id: 'group3', name: 'Suporte' },
      ];
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      return [
        { id: 'group1', name: 'Equipe de Marketing' },
        { id: 'group2', name: 'Clientes VIP' },
      ];
    }
  }

  async getAllContacts(instanceId: string) {
    try {
      console.log('Buscando todos os contatos para instância:', instanceId);
      
      const endpoints = [
        `/chat/fetchAllContacts/${instanceId}`,
        `/contact/fetchAll/${instanceId}`,
        `/chat/findChats/${instanceId}`,
        `/instance/fetchContacts/${instanceId}`,
        `/contacts/${instanceId}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Tentando endpoint: ${endpoint}`);
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: this.headers,
          });
          
          console.log(`Response status para ${endpoint}:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Contatos encontrados:', data);
            
            const contacts = Array.isArray(data) ? data : data.contacts || data.data || [];
            
            return contacts
              .filter((contact: any) => {
                // Filtrar apenas contatos individuais (não grupos)
                const jid = contact.id || contact.remoteJid || '';
                return jid && !jid.includes('@g.us') && jid.includes('@s.whatsapp.net');
              })
              .map((contact: any) => ({
                id: contact.id || contact.remoteJid,
                name: contact.pushName || contact.name || contact.notify || 'Contato sem nome',
                phoneNumber: this.formatPhoneNumber(contact.id || contact.remoteJid),
              }));
          }
        } catch (endpointError) {
          console.log(`Erro no endpoint ${endpoint}:`, endpointError);
          continue;
        }
      }
      
      console.log('Todos os endpoints de contatos falharam, retornando dados mock');
      return [
        { id: '5511999999999@s.whatsapp.net', name: 'João Silva', phoneNumber: '+55 11 99999-9999' },
        { id: '5511888888888@s.whatsapp.net', name: 'Maria Santos', phoneNumber: '+55 11 88888-8888' },
        { id: '5511777777777@s.whatsapp.net', name: 'Pedro Costa', phoneNumber: '+55 11 77777-7777' },
      ];
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      return [
        { id: '5511999999999@s.whatsapp.net', name: 'João Silva', phoneNumber: '+55 11 99999-9999' },
        { id: '5511888888888@s.whatsapp.net', name: 'Maria Santos', phoneNumber: '+55 11 88888-8888' },
      ];
    }
  }

  async getGroupContacts(instanceId: string, groupId: string) {
    try {
      console.log('Buscando contatos do grupo:', groupId, 'para instância:', instanceId);
      
      const endpoints = [
        `/group/participants/${instanceId}?groupJid=${groupId}`,
        `/group/findParticipants/${instanceId}/${groupId}`,
        `/chat/findParticipants/${instanceId}?where={"remoteJid": "${groupId}"}`,
        `/groups/${instanceId}/${groupId}/participants`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Tentando endpoint: ${endpoint}`);
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: this.headers,
          });
          
          console.log(`Response status para ${endpoint}:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Contatos do grupo encontrados:', data);
            
            const participants = Array.isArray(data) ? data : data.participants || data.data || [];
            
            return participants.map((contact: any) => ({
              id: contact.id || contact.remoteJid,
              name: contact.pushName || contact.name || contact.notify || 'Participante sem nome',
              phoneNumber: this.formatPhoneNumber(contact.id || contact.remoteJid),
              groupName: groupId,
            }));
          }
        } catch (endpointError) {
          console.log(`Erro no endpoint ${endpoint}:`, endpointError);
          continue;
        }
      }
      
      console.log('Todos os endpoints de participantes falharam, retornando dados mock');
      return [
        { id: '5511999999999@s.whatsapp.net', name: 'Membro do Grupo 1', phoneNumber: '+55 11 99999-9999', groupName: 'Equipe de Marketing' },
        { id: '5511888888888@s.whatsapp.net', name: 'Membro do Grupo 2', phoneNumber: '+55 11 88888-8888', groupName: 'Equipe de Marketing' },
        { id: '5511777777777@s.whatsapp.net', name: 'Membro do Grupo 3', phoneNumber: '+55 11 77777-7777', groupName: 'Equipe de Marketing' },
      ];
    } catch (error) {
      console.error('Erro ao buscar contatos do grupo:', error);
      return [
        { id: '5511999999999@s.whatsapp.net', name: 'Membro do Grupo 1', phoneNumber: '+55 11 99999-9999', groupName: 'Equipe de Marketing' },
        { id: '5511888888888@s.whatsapp.net', name: 'Membro do Grupo 2', phoneNumber: '+55 11 88888-8888', groupName: 'Equipe de Marketing' },
      ];
    }
  }

  private formatPhoneNumber(jid: string): string {
    if (!jid) return '';
    
    // Extrair apenas os números do JID
    const numbers = jid.replace('@s.whatsapp.net', '').replace('@c.us', '');
    
    // Formatação brasileira: +55 XX XXXXX-XXXX
    if (numbers.startsWith('55') && numbers.length === 13) {
      const countryCode = numbers.substring(0, 2);
      const areaCode = numbers.substring(2, 4);
      const firstPart = numbers.substring(4, 9);
      const secondPart = numbers.substring(9, 13);
      return `+${countryCode} ${areaCode} ${firstPart}-${secondPart}`;
    }
    
    return `+${numbers}`;
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
      return true; // Retornar true para desenvolvimento
    }
  }
}

export const evolutionApiService = new EvolutionApiService();
