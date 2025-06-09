
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MessageEditor } from '../IntelligentNotifications/MessageEditor';
import { Notification } from './types';
import { Message } from '../IntelligentNotifications/types';
import { FormHeader } from './EditNotificationForm/FormHeader';
import { BasicFieldsSection } from './EditNotificationForm/BasicFieldsSection';
import { UserRoleSection } from './EditNotificationForm/UserRoleSection';
import { FormActions } from './EditNotificationForm/FormActions';
import { useEditFormValidation } from './EditNotificationForm/useEditFormValidation';

interface EditNotificationFormProps {
  notification: Notification;
  onSave: (updatedData: any) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EditNotificationForm = ({ 
  notification, 
  onSave, 
  onCancel, 
  isLoading = false 
}: EditNotificationFormProps) => {
  const [formData, setFormData] = useState({
    eventType: '',
    platform: '',
    profileName: '',
    instanceId: '',
    userRole: '',
    messages: [] as Message[]
  });
  const [isFormLoading, setIsFormLoading] = useState(false);

  const { isFormValid } = useEditFormValidation(formData);

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
    
    // Mapear campos de forma mais robusta
    const initialFormData = {
      eventType: parsedData.eventType || notification['Tipo de Evento'] || '',
      platform: parsedData.platform || notification['Plataforma'] || '',
      profileName: parsedData.profileName || parsedData.hotmartProfile || notification['Perfil Hotmart'] || '',
      instanceId: parsedData.instance || parsedData.instanceId || notification['ID da Instância'] || '',
      userRole: parsedData.userRole || notification['Papel do Usuário'] || notification['Função do Usuário'] || '',
      messages: initializeMessages(parsedData.messages || [])
    };
    
    console.log('📋 Dados iniciais do formulário:', initialFormData);
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

  const handleSave = async () => {
    try {
      console.log('💾 Iniciando salvamento da edição...');
      console.log('📋 Dados do formulário a serem salvos:', formData);
      
      if (!isFormValid) {
        console.error('❌ Formulário inválido - campos obrigatórios não preenchidos');
        return;
      }

      setIsFormLoading(true);
      
      // Preparar dados no formato correto para o serviço de salvamento
      const dataToSave = {
        eventType: formData.eventType,
        platform: formData.platform,
        profileName: formData.profileName,
        instanceId: formData.instanceId,
        userRole: formData.userRole,
        messages: formData.messages.filter(msg => msg.content.trim() !== '').map(msg => ({
          id: msg.id,
          type: msg.type,
          content: msg.content,
          delay: msg.delay,
          ...(msg.fileUrl && { fileUrl: msg.fileUrl }),
          ...(msg.file && { file: msg.file })
        }))
      };

      console.log('📤 Dados formatados para salvamento:', dataToSave);
      
      const success = await onSave(dataToSave);
      
      if (success) {
        console.log('✅ Edição salva com sucesso');
      } else {
        console.error('❌ Falha ao salvar edição');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar edição:', error);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleAddMessage = () => {
    if (formData.messages.length >= 5) {
      console.log('⚠️ Limite máximo de mensagens atingido');
      return;
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content: '',
      delay: 0
    };
    
    console.log('➕ Adicionando nova mensagem:', newMessage);
    setFormData(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };

  const handleRemoveMessage = (messageId: string) => {
    if (formData.messages.length <= 1) {
      console.log('⚠️ Não é possível remover - mínimo de 1 mensagem');
      return;
    }
    
    console.log('🗑️ Removendo mensagem:', messageId);
    setFormData(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== messageId)
    }));
  };

  const handleUpdateMessage = (messageId: string, updates: Partial<Message>) => {
    console.log(`📝 Atualizando mensagem ${messageId}:`, updates);
    setFormData(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    }));
  };

  const handleMessageFileUpload = async (messageId: string, file: File) => {
    try {
      setIsFormLoading(true);
      console.log('📁 Upload de arquivo para mensagem:', messageId, file.name);
      
      // Por enquanto, simular o upload
      const fileUrl = `https://example.com/uploads/${Date.now()}-${file.name}`;
      
      handleUpdateMessage(messageId, { 
        file: file as any,
        fileUrl: fileUrl 
      });
      
    } catch (error) {
      console.error('❌ Erro no upload do arquivo:', error);
    } finally {
      setIsFormLoading(false);
    }
  };

  const currentIsLoading = isLoading || isFormLoading;

  return (
    <Card className="border-blue-500/50 bg-blue-500/10">
      <FormHeader notification={notification} onCancel={onCancel} />
      <CardContent className="space-y-6">
        <BasicFieldsSection 
          formData={formData}
          onUpdate={handleFieldUpdate}
        />

        <UserRoleSection 
          userRole={formData.userRole}
          onUpdate={handleUserRoleUpdate}
        />

        {/* Editor de Mensagens */}
        <div className="space-y-4">
          <Label className="text-gray-200 font-medium text-sm">Configuração das Mensagens</Label>
          <MessageEditor
            messages={formData.messages}
            onAddMessage={handleAddMessage}
            onRemoveMessage={handleRemoveMessage}
            onUpdateMessage={handleUpdateMessage}
            onFileUpload={handleMessageFileUpload}
          />
        </div>

        <FormActions
          onSave={handleSave}
          onCancel={onCancel}
          isLoading={currentIsLoading}
          isFormValid={isFormValid}
        />
      </CardContent>
    </Card>
  );
};
