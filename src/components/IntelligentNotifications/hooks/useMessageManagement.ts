
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { minioService } from '@/services/minio';
import { Message, NotificationRule } from '../types';

export const useMessageManagement = (
  newRule: Partial<NotificationRule>,
  setNewRule: (rule: Partial<NotificationRule> | ((prev: Partial<NotificationRule>) => Partial<NotificationRule>)) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const { toast } = useToast();

  const addMessage = () => {
    if (!newRule.messages || newRule.messages.length >= 5) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content: '',
      delay: 0
    };
    
    setNewRule(prev => ({
      ...prev,
      messages: [...(prev.messages || []), newMessage]
    }));
  };

  const removeMessage = (messageId: string) => {
    setNewRule(prev => ({
      ...prev,
      messages: prev.messages?.filter(msg => msg.id !== messageId) || []
    }));
  };

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setNewRule(prev => ({
      ...prev,
      messages: prev.messages?.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      ) || []
    }));
  };

  const handleFileUpload = async (messageId: string, file: File) => {
    try {
      setIsLoading(true);
      const fileUrl = await minioService.uploadFile(file);
      updateMessage(messageId, { file, fileUrl });
      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar arquivo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addMessage,
    removeMessage,
    updateMessage,
    handleFileUpload,
  };
};
