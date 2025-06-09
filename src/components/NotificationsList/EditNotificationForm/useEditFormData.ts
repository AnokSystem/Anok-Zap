
import { useState, useEffect } from 'react';
import { Notification } from '../types';
import { Message } from '../../IntelligentNotifications/types';

interface FormData {
  eventType: string;
  platform: string;
  profileName: string;
  instanceId: string;
  userRole: string;
  messages: Message[];
}

export const useEditFormData = (notification: Notification) => {
  const [formData, setFormData] = useState<FormData>({
    eventType: '',
    platform: '',
    profileName: '',
    instanceId: '',
    userRole: '',
    messages: []
  });

  // Initialize messages with default structure if empty
  const initializeMessages = (messages: any[]): Message[] => {
    if (!messages || messages.length === 0) {
      return [{ id: '1', type: 'text', content: '', delay: 0 }];
    }
    
    return messages.map((msg, index) => ({
      id: msg.id || (index + 1).toString(),
      type: msg.type || 'text',
      content: msg.content || '',
      delay: msg.delay || 0,
      file: msg.file,
      fileUrl: msg.fileUrl
    }));
  };

  useEffect(() => {
    console.log('🔄 Inicializando formulário de edição com notificação:', notification);
    
    // Parse dos dados da notificação para preencher o formulário
    let parsedData: any = {};
    
    if (notification['Dados Completos (JSON)']) {
      try {
        parsedData = JSON.parse(notification['Dados Completos (JSON)']);
        console.log('✅ Dados JSON parseados:', parsedData);
      } catch (e) {
        console.error('❌ Erro ao fazer parse do JSON:', e);
        parsedData = {};
      }
    }
    
    // Mapear campos de forma mais robusta - CORRIGIDO: usar 'instance' como prioridade
    const initialFormData = {
      eventType: parsedData.eventType || notification['Tipo de Evento'] || '',
      platform: parsedData.platform || notification['Plataforma'] || 'hotmart',
      profileName: parsedData.profileName || parsedData.hotmartProfile || notification['Perfil Hotmart'] || '',
      instanceId: parsedData.instanceId || parsedData.instance || notification['ID da Instância'] || '',
      userRole: parsedData.userRole || notification['Papel do Usuário'] || notification['Função do Usuário'] || '',
      messages: initializeMessages(parsedData.messages || [])
    };
    
    console.log('📋 Dados iniciais do formulário (CORRIGIDO):', initialFormData);
    console.log('🔑 ID da notificação para edição:', notification.ID);
    setFormData(initialFormData);
  }, [notification]);

  const handleFieldUpdate = (field: string, value: string) => {
    console.log(`📝 Atualizando campo ${field}:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUserRoleUpdate = (value: string) => {
    console.log('👤 Atualizando papel do usuário:', value);
    setFormData(prev => ({ ...prev, userRole: value }));
  };

  return {
    formData,
    setFormData,
    handleFieldUpdate,
    handleUserRoleUpdate
  };
};
