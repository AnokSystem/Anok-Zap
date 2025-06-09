
import { useState } from 'react';
import { Message } from '../../IntelligentNotifications/types';

interface FormData {
  messages: Message[];
}

export const useEditFormMessages = (
  formData: FormData,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  setIsFormLoading: (loading: boolean) => void
) => {
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

  return {
    handleAddMessage,
    handleRemoveMessage,
    handleUpdateMessage,
    handleMessageFileUpload
  };
};
