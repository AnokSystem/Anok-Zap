
import { useToast } from "@/hooks/use-toast";
import { Message, NotificationRule } from '../types';
import { messageService } from '../services/messageService';
import { fileUploadService } from '../services/fileUploadService';

export const useMessageManagement = (
  newRule: Partial<NotificationRule>,
  setNewRule: (rule: Partial<NotificationRule> | ((prev: Partial<NotificationRule>) => Partial<NotificationRule>)) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const { toast } = useToast();

  const addMessage = () => {
    if (!newRule.messages || newRule.messages.length >= 5) return;
    
    const updatedMessages = messageService.addMessage(newRule.messages);
    setNewRule(prev => ({
      ...prev,
      messages: updatedMessages
    }));
  };

  const removeMessage = (messageId: string) => {
    const updatedMessages = messageService.removeMessage(newRule.messages, messageId);
    setNewRule(prev => ({
      ...prev,
      messages: updatedMessages
    }));
  };

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    const updatedMessages = messageService.updateMessage(newRule.messages, messageId, updates);
    setNewRule(prev => ({
      ...prev,
      messages: updatedMessages
    }));
  };

  const handleFileUpload = async (messageId: string, file: File) => {
    try {
      setIsLoading(true);
      const fileUrl = await fileUploadService.uploadFile(file);
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
