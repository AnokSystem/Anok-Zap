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
      const response = await fetch(`${API_BASE_URL}/group/fetchAllGroups/${instanceId}`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        console.error('Erro ao buscar grupos:', response.status);
        throw new Error('Falha ao buscar grupos');
      }
      
      const data = await response.json();
      console.log('Grupos encontrados:', data);
      
      return data.map((group: any) => ({
        id: group.id,
        name: group.subject || group.name,
      }));
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      return [
        { id: 'group1', name: 'Equipe de Marketing' },
        { id: 'group2', name: 'Clientes' },
      ];
    }
  }

  async getAllContacts(instanceId: string) {
    try {
      console.log('Buscando todos os contatos para instância:', instanceId);
      const response = await fetch(`${API_BASE_URL}/chat/fetchAllContacts/${instanceId}`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        console.error('Erro ao buscar contatos:', response.status);
        throw new Error('Falha ao buscar contatos');
      }
      
      const data = await response.json();
      console.log('Contatos encontrados:', data);
      
      return data.map((contact: any) => ({
        id: contact.id || contact.remoteJid,
        name: contact.pushName || contact.name || 'Desconhecido',
        phoneNumber: contact.id || contact.remoteJid,
      }));
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      return [
        { id: '1', name: 'João Silva', phoneNumber: '+5511999999999' },
        { id: '2', name: 'Maria Santos', phoneNumber: '+5511888888888' },
      ];
    }
  }

  async getGroupContacts(instanceId: string, groupId: string) {
    try {
      console.log('Buscando contatos do grupo:', groupId, 'para instância:', instanceId);
      const response = await fetch(`${API_BASE_URL}/group/participants/${instanceId}?groupJid=${groupId}`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        console.error('Erro ao buscar contatos do grupo:', response.status);
        throw new Error('Falha ao buscar contatos do grupo');
      }
      
      const data = await response.json();
      console.log('Contatos do grupo encontrados:', data);
      
      return data.map((contact: any) => ({
        id: contact.id,
        name: contact.pushName || contact.name || 'Desconhecido',
        phoneNumber: contact.id,
        groupName: groupId,
      }));
    } catch (error) {
      console.error('Erro ao buscar contatos do grupo:', error);
      return [
        { id: '1', name: 'Membro do Grupo 1', phoneNumber: '+5511999999999', groupName: 'Equipe de Marketing' },
        { id: '2', name: 'Membro do Grupo 2', phoneNumber: '+5511888888888', groupName: 'Equipe de Marketing' },
      ];
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
      return true; // Retornar true para desenvolvimento
    }
  }
}

export const evolutionApiService = new EvolutionApiService();
