const API_BASE_URL = 'https://api.novahagencia.com.br';
const API_KEY = '26bda82495a95caeae71f96534841285';
const GROUPS_WEBHOOK_URL = 'https://webhook.novahagencia.com.br/webhook/2c8dfd55-c86f-4cd7-bcc9-eef206e16003';

class GroupsApiService {
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

  private isUserInstance(instanceName: string, userId: string): boolean {
    return instanceName.includes(`user-${userId}`);
  }

  // Buscar informações da própria instância para obter o número do WhatsApp
  private async getInstanceInfo(instanceId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/instance/fetchInstances`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const instances = await response.json();
      const currentInstance = instances.find((inst: any) => 
        (inst.name || inst.instanceName || inst.id) === instanceId
      );
      
      if (currentInstance && currentInstance.ownerJid) {
        // Extrair número do ownerJid (ex: "5573933005110@s.whatsapp.net" -> "5573933005110")
        const phoneNumber = currentInstance.ownerJid.replace('@s.whatsapp.net', '').replace('@c.us', '');
        console.log(`📱 Número da instância ${instanceId}: ${phoneNumber}`);
        return phoneNumber;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar info da instância:', error);
      return null;
    }
  }

  // Verificar se o participante é o usuário atual da instância
  private isCurrentUser(participantId: string, instancePhoneNumber: string): boolean {
    if (!participantId || !instancePhoneNumber) return false;
    
    const participantNumber = participantId
      .replace('@s.whatsapp.net', '')
      .replace('@c.us', '')
      .replace('@g.us', '');
    
    console.log(`🔍 Comparando participante "${participantNumber}" com instância "${instancePhoneNumber}"`);
    
    const isMatch = participantNumber === instancePhoneNumber;
    
    if (isMatch) {
      console.log(`✅ MATCH encontrado: "${participantNumber}" é o dono da instância`);
    }
    
    return isMatch;
  }

  // Extrair número da instância para comparação - versão mais flexível
  private extractNumberFromInstance(instanceId: string): string {
    // Remover prefixos e sufixos para obter apenas o número
    const cleaned = instanceId.replace(/^.*user-?/, '').replace(/-.*$/, '');
    console.log(`📱 Extraindo número de "${instanceId}" -> "${cleaned}"`);
    return cleaned;
  }

  // Verificar se o participante é o usuário atual - versão mais flexível
  private isCurrentUserOld(participantId: string, myNumber: string): boolean {
    const participantNumber = (participantId || '')
      .replace('@s.whatsapp.net', '')
      .replace('@c.us', '')
      .replace(/^\+55/, '') // Remove código do país
      .replace(/^\+/, ''); // Remove qualquer +
    
    const myCleanNumber = myNumber.replace(/^\+55/, '').replace(/^\+/, '');
    
    console.log(`🔍 Comparando participante "${participantNumber}" com meu número "${myCleanNumber}"`);
    
    // Múltiplas formas de comparação para garantir compatibilidade
    const isMatch = participantNumber === myCleanNumber || 
           participantNumber.includes(myCleanNumber) || 
           myCleanNumber.includes(participantNumber) ||
           participantNumber.endsWith(myCleanNumber) ||
           myCleanNumber.endsWith(participantNumber);
           
    if (isMatch) {
      console.log(`✅ MATCH encontrado: "${participantNumber}" corresponde a "${myCleanNumber}"`);
    }
    
    return isMatch;
  }

  // Verificar se o participante tem privilégios de admin
  private isAdminUser(participant: any): boolean {
    const isAdmin = participant.admin === 'admin' || 
           participant.admin === 'superadmin' || 
           participant.isAdmin === true ||
           participant.isSuperAdmin === true;
           
    console.log(`👤 Verificando admin para participante:`, {
      admin: participant.admin,
      isAdmin: participant.isAdmin,
      isSuperAdmin: participant.isSuperAdmin,
      resultado: isAdmin
    });
    
    return isAdmin;
  }

  // Verificar se o participante tem privilégios de SUPERADMIN - versão mais flexível
  private isSuperAdminUser(participant: any): boolean {
    const isSuperAdmin = participant.admin === 'superadmin' || 
           participant.admin === 'admin' || // Incluir admin também
           participant.isSuperAdmin === true ||
           participant.isAdmin === true; // Incluir admin também
           
    console.log(`👑 Verificando superadmin para participante:`, {
      admin: participant.admin,
      isAdmin: participant.isAdmin,
      isSuperAdmin: participant.isSuperAdmin,
      resultado: isSuperAdmin
    });
           
    return isSuperAdmin;
  }

  // Buscar TODOS os grupos (para seção de contatos)
  async getAllGroups(instanceId: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        console.log('❌ Acesso negado à instância:', instanceId);
        return [];
      }

      console.log('🔍 Buscando TODOS os grupos para instância:', instanceId);
      
      const response = await fetch(`${API_BASE_URL}/group/fetchAllGroups/${instanceId}?getParticipants=true`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      const groups = Array.isArray(data) ? data : data.groups || data.data || [];
      
      console.log(`📊 Total de grupos encontrados: ${groups.length}`);
      
      // Mapear para o formato padronizado SEM filtro - todos os grupos
      const formattedGroups = groups.map((group: any) => ({
        id: group.id || group.remoteJid,
        name: group.subject || group.name || 'Grupo sem nome',
        description: group.description || '',
        pictureUrl: group.pictureUrl || '',
        size: group.size || (group.participants ? group.participants.length : 0),
        creationTime: group.creationTime || '',
        isAnnounce: group.announce || false,
        isRestricted: group.restrict || false,
        participants: group.participants || []
      }));
      
      console.log(`📋 Todos os grupos formatados para retorno: ${formattedGroups.length}`);
      return formattedGroups;
      
    } catch (error) {
      console.error('❌ Erro ao buscar todos os grupos:', error);
      return [];
    }
  }

  // Buscar grupos via API Evolution - apenas grupos onde sou SUPERADMIN (para seção extras)
  async getGroups(instanceId: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        console.log('❌ Acesso negado à instância:', instanceId);
        return [];
      }

      console.log('🔍 Buscando grupos onde sou SUPERADMIN para instância:', instanceId);
      
      // Primeiro, buscar informações da instância para obter o número do WhatsApp
      const instancePhoneNumber = await this.getInstanceInfo(instanceId);
      if (!instancePhoneNumber) {
        console.log('❌ Não foi possível obter o número da instância');
        return [];
      }
      
      // Buscar grupos com participantes para verificar se sou superadmin
      const response = await fetch(`${API_BASE_URL}/group/fetchAllGroups/${instanceId}?getParticipants=true`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      const groups = Array.isArray(data) ? data : data.groups || data.data || [];
      
      console.log(`📊 Total de grupos encontrados: ${groups.length}`);
      
      // Filtrar apenas grupos onde sou SUPERADMIN
      const superAdminGroups = groups.filter((group: any) => {
        const participants = group.participants || [];
        console.log(`🔍 Verificando grupo "${group.subject || group.name}": ${participants.length} participantes`);
        
        // Procurar por mim mesmo na lista de participantes
        const myParticipation = participants.find((participant: any) => {
          const participantId = participant.id || participant.jid || '';
          const isMe = this.isCurrentUser(participantId, instancePhoneNumber);
          
          if (isMe) {
            const isSuperAdmin = participant.admin === 'superadmin';
            console.log(`👤 Encontrado no grupo "${group.subject || group.name}":`, {
              participantId,
              admin: participant.admin,
              isSuperAdmin: isSuperAdmin
            });
            return isSuperAdmin;
          }
          
          return false;
        });
        
        const hasAccess = !!myParticipation;
        if (hasAccess) {
          console.log(`✅ Grupo "${group.subject || group.name}" - Acesso confirmado como SUPERADMIN`);
        }
        
        return hasAccess;
      });
      
      console.log(`✅ Encontrados ${superAdminGroups.length} grupos onde sou SUPERADMIN de ${groups.length} grupos totais`);
      
      // Mapear para o formato padronizado
      const formattedGroups = superAdminGroups.map((group: any) => ({
        id: group.id || group.remoteJid,
        name: group.subject || group.name || 'Grupo sem nome',
        description: group.description || '',
        pictureUrl: group.pictureUrl || '',
        size: group.size || (group.participants ? group.participants.length : 0),
        creationTime: group.creationTime || '',
        isAnnounce: group.announce || false,
        isRestricted: group.restrict || false,
        participants: group.participants || []
      }));
      
      console.log(`📋 Grupos SUPERADMIN formatados para retorno: ${formattedGroups.length}`);
      return formattedGroups;
      
    } catch (error) {
      console.error('❌ Erro ao buscar grupos onde sou SUPERADMIN:', error);
      return [];
    }
  }

  // Buscar participantes de um grupo
  async getGroupParticipants(instanceId: string, groupId: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/group/participants/${instanceId}?groupJid=${groupId}`, {
        headers: this.headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        const participants = Array.isArray(data) ? data : data.participants || data.data || [];
        
        return participants.map((participant: any) => ({
          id: participant.id || participant.jid,
          name: participant.notify || participant.name || participant.pushName || 'Participante',
          phoneNumber: participant.id?.replace('@s.whatsapp.net', '') || '',
          isAdmin: participant.admin === 'admin' || participant.isAdmin === true,
          isSuperAdmin: participant.admin === 'superadmin' || participant.isSuperAdmin === true,
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      return [];
    }
  }

  // Excluir grupo
  async deleteGroup(instanceId: string, groupId: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const webhookData = {
        action: 'delete_group',
        instanceId,
        userId,
        groupId,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Grupo excluído via webhook');
        return true;
      }
      
      throw new Error('Falha ao excluir grupo');
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      throw error;
    }
  }

  // Remover todos os participantes
  async removeAllParticipants(instanceId: string, groupId: string, participantIds: string[]) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const webhookData = {
        action: 'remove_all_participants',
        instanceId,
        userId,
        groupId,
        data: {
          participantIds: participantIds
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Todos os participantes removidos via webhook');
        return true;
      }
      
      throw new Error('Falha ao remover participantes');
    } catch (error) {
      console.error('Erro ao remover todos os participantes:', error);
      throw error;
    }
  }

  // Obter código de convite do grupo
  async getGroupInviteCode(instanceId: string, groupId: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const response = await fetch(`${API_BASE_URL}/group/inviteCode/${instanceId}?groupJid=${groupId}`, {
        headers: this.headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.inviteCode || data.code;
      }
      
      throw new Error('Falha ao obter código de convite');
    } catch (error) {
      console.error('Erro ao obter código de convite:', error);
      throw error;
    }
  }

  // Nova função para criar grupo em lote - UPLOAD MINIO + WEBHOOK
  async createGroupBatch(instanceId: string, actions: any[]) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const processedActions = await Promise.all(actions.map(async (action) => {
        if (action.action === 'update_group_picture' && action.data.profileImage instanceof File) {
          console.log('Fazendo upload da imagem para NocoDB...');
          
          const { fileUploadService } = await import('@/services/fileUpload');
          
          try {
            const imageUrl = await fileUploadService.uploadFile(action.data.profileImage);
            console.log('Imagem enviada para NocoDB com sucesso:', imageUrl);
            
            return {
              ...action,
              data: {
                imageUrl: imageUrl,
                fileName: action.data.profileImage.name,
                fileType: action.data.profileImage.type
              }
            };
          } catch (uploadError) {
            console.error('Erro no upload da imagem para NocoDB:', uploadError);
            throw new Error('Falha no upload da imagem de perfil');
          }
        }
        return action;
      }));

      const webhookData = {
        action: 'create_group_batch',
        instanceId,
        userId,
        data: {
          actions: processedActions,
          executeAll: true
        },
        timestamp: new Date().toISOString(),
      };

      console.log('Enviando dados para webhook:', webhookData);

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Criação de grupo em lote enviada via webhook');
        return true;
      }
      
      throw new Error('Falha ao enviar criação em lote');
    } catch (error) {
      console.error('Erro ao criar grupo em lote:', error);
      throw error;
    }
  }

  // Função auxiliar para converter File para base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Falha ao converter arquivo para base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  }

  // Nova função para atualizar múltiplas informações do grupo
  async updateGroupBatch(instanceId: string, groupId: string, actions: any[]) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const webhookData = {
        action: 'update_group_batch',
        instanceId,
        userId,
        groupId,
        data: {
          actions: actions
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Atualizações em lote enviadas via webhook');
        return true;
      }
      
      throw new Error('Falha ao enviar atualizações');
    } catch (error) {
      console.error('Erro ao enviar atualizações em lote:', error);
      throw error;
    }
  }

  // Criar grupo via webhook
  async createGroup(instanceId: string, groupData: { name: string; description?: string; isPrivate?: boolean; participants?: string[] }) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const webhookData = {
        action: 'create_group',
        instanceId,
        userId,
        data: {
          name: groupData.name,
          description: groupData.description || '',
          isPrivate: groupData.isPrivate || false,
          participants: groupData.participants || [],
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Grupo criado via webhook');
        return true;
      }
      
      throw new Error('Falha ao criar grupo');
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      throw error;
    }
  }

  // Atualizar imagem do grupo
  async updateGroupPicture(instanceId: string, groupId: string, imageFile: File) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const formData = new FormData();
      formData.append('image', imageFile);

      const webhookData = {
        action: 'update_group_picture',
        instanceId,
        userId,
        groupId,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Imagem do grupo atualizada via webhook');
        return true;
      }
      
      throw new Error('Falha ao atualizar imagem');
    } catch (error) {
      console.error('Erro ao atualizar imagem:', error);
      throw error;
    }
  }

  // Atualizar nome do grupo
  async updateGroupName(instanceId: string, groupId: string, newName: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const webhookData = {
        action: 'update_group_name',
        instanceId,
        userId,
        groupId,
        data: {
          name: newName,
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Nome do grupo atualizado via webhook');
        return true;
      }
      
      throw new Error('Falha ao atualizar nome');
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      throw error;
    }
  }

  // Atualizar descrição do grupo
  async updateGroupDescription(instanceId: string, groupId: string, newDescription: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const webhookData = {
        action: 'update_group_description',
        instanceId,
        userId,
        groupId,
        data: {
          description: newDescription,
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Descrição do grupo atualizada via webhook');
        return true;
      }
      
      throw new Error('Falha ao atualizar descrição');
    } catch (error) {
      console.error('Erro ao atualizar descrição:', error);
      throw error;
    }
  }

  // Atualizar configurações do grupo
  async updateGroupSettings(instanceId: string, groupId: string, settings: { isAnnounce?: boolean; isRestricted?: boolean }) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const webhookData = {
        action: 'update_group_settings',
        instanceId,
        userId,
        groupId,
        data: settings,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Configurações do grupo atualizadas via webhook');
        return true;
      }
      
      throw new Error('Falha ao atualizar configurações');
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  }

  // Gerenciar participantes
  async manageParticipant(instanceId: string, groupId: string, participantId: string, action: 'add' | 'remove' | 'promote' | 'demote') {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const webhookData = {
        action: 'manage_participant',
        instanceId,
        userId,
        groupId,
        data: {
          participantId,
          participantAction: action,
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log(`Participante ${action} via webhook`);
        return true;
      }
      
      throw new Error(`Falha ao ${action} participante`);
    } catch (error) {
      console.error(`Erro ao ${action} participante:`, error);
      throw error;
    }
  }

  // Adicionar participantes ao grupo
  async addParticipants(instanceId: string, groupId: string, participantIds: string[]) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const webhookData = {
        action: 'add_participants',
        instanceId,
        userId,
        groupId,
        data: {
          participantIds: participantIds
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GROUPS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        console.log('Participantes adicionados via webhook');
        return true;
      }
      
      throw new Error('Falha ao adicionar participantes');
    } catch (error) {
      console.error('Erro ao adicionar participantes:', error);
      throw error;
    }
  }

  // Enviar mensagem para grupo (mantém a funcionalidade original)
  async sendMessageToGroup(instanceId: string, groupId: string, message: string) {
    try {
      const userId = this.getUserId();
      if (!userId || !this.isUserInstance(instanceId, userId)) {
        throw new Error('Acesso negado à instância');
      }

      const response = await fetch(`${API_BASE_URL}/message/sendText/${instanceId}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          number: groupId,
          text: message,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem');
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }
}

export const groupsApiService = new GroupsApiService();
