
import { useToast } from "@/hooks/use-toast";
import { Message } from '../types';
import { VariableProcessor } from '../utils/variableProcessor';

export const useCampaignValidation = () => {
  const { toast } = useToast();

  const validateMessages = (messages: Message[]): boolean => {
    for (const message of messages) {
      if (message.type === 'text') {
        const validation = VariableProcessor.validateMessage(message.content);
        if (!validation.isValid) {
          toast({
            title: "Erro de Validação",
            description: `Mensagem ${messages.indexOf(message) + 1}: ${validation.errors.join(', ')}`,
            variant: "destructive",
          });
          return false;
        }
      }
      
      // Validar descrição do arquivo se existir
      if (message.caption) {
        const captionValidation = VariableProcessor.validateMessage(message.caption);
        if (!captionValidation.isValid) {
          toast({
            title: "Erro de Validação",
            description: `Descrição da mensagem ${messages.indexOf(message) + 1}: ${captionValidation.errors.join(', ')}`,
            variant: "destructive",
          });
          return false;
        }
      }
    }
    return true;
  };

  return { validateMessages };
};
