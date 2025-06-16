
import { Message } from '../types';
import { VariableProcessor } from '../utils/variableProcessor';

export const useMessageProcessor = () => {
  const processMessagesWithVariables = (messages: Message[], recipients: string[]) => {
    return recipients.map(recipient => {
      // Extrair nome e telefone do formato "telefone - nome" ou apenas "telefone"
      const [phoneNumber, ...nameParts] = recipient.split(' - ');
      const contactName = nameParts.length > 0 ? nameParts.join(' - ') : phoneNumber;
      
      const contactData = {
        name: contactName,
        phoneNumber: phoneNumber.trim()
      };
      
      // Processar cada mensagem com as variáveis do contato
      const processedMessages = messages.map(message => ({
        ...message,
        content: message.type === 'text' 
          ? VariableProcessor.processMessage(message.content, contactData)
          : message.content,
        // Processar descrição do arquivo se existir
        caption: message.caption 
          ? VariableProcessor.processMessage(message.caption, contactData)
          : message.caption,
        // Preservar fileUrl para todos os tipos de mensagem
        fileUrl: message.fileUrl || '',
        file: message.file
      }));
      
      return {
        contact: contactData,
        messages: processedMessages
      };
    });
  };

  return { processMessagesWithVariables };
};
