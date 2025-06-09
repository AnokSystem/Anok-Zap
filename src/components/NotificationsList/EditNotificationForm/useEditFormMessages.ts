
import { useState } from 'react';
import { Message } from '../../IntelligentNotifications/types';
import { fileUploadService } from '../../IntelligentNotifications/services/fileUploadService';
import { useToast } from "@/hooks/use-toast";

interface FormData {
  messages: Message[];
}

export const useEditFormMessages = (
  formData: FormData,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  setIsFormLoading: (loading: boolean) => void
) => {
  const { toast } = useToast();

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
      console.log('📁 MINIO - Upload iniciado para mensagem:', messageId, file.name);
      console.log('📁 MINIO - Tamanho do arquivo:', file.size, 'bytes');
      console.log('📁 MINIO - Tipo do arquivo:', file.type);
      
      // Usar o serviço de upload que já está integrado com MinIO
      const fileUrl = await fileUploadService.uploadFile(file);
      
      console.log('✅ MINIO - Upload realizado com sucesso:', fileUrl);
      
      // Atualizar a mensagem com o arquivo e URL
      handleUpdateMessage(messageId, { 
        file: file as any,
        fileUrl: fileUrl 
      });
      
      toast({
        title: "✅ Upload Realizado",
        description: `Arquivo ${file.name} enviado com sucesso`,
      });
      
    } catch (error) {
      console.error('❌ MINIO - Erro no upload do arquivo:', error);
      console.error('❌ MINIO - Stack trace:', error.stack);
      
      toast({
        title: "❌ Erro no Upload",
        description: `Falha ao enviar arquivo: ${error.message}`,
        variant: "destructive",
      });
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
