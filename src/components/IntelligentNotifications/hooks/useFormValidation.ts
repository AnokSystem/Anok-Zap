
import { NotificationRule } from '../types';

export const useFormValidation = () => {
  const validateForm = (rule: Partial<NotificationRule>) => {
    if (!rule.instanceId?.trim()) {
      return { isValid: false, error: 'Selecione uma instância' };
    }

    if (!rule.eventType?.trim()) {
      return { isValid: false, error: 'Selecione um tipo de evento' };
    }

    if (!rule.userRole?.trim()) {
      return { isValid: false, error: 'Selecione o papel do usuário' };
    }

    if (!rule.platform?.trim()) {
      return { isValid: false, error: 'Selecione uma plataforma' };
    }

    if (!rule.profileName?.trim()) {
      return { isValid: false, error: 'Digite o nome do perfil' };
    }

    if (!rule.productScope) {
      return { isValid: false, error: 'Selecione o escopo do produto' };
    }

    if (rule.productScope === 'specific' && !rule.specificProductName?.trim()) {
      return { isValid: false, error: 'Digite o nome do produto específico' };
    }

    if (!rule.messages || rule.messages.length === 0) {
      return { isValid: false, error: 'Adicione pelo menos uma mensagem' };
    }

    // Validar se todas as mensagens têm conteúdo
    for (const message of rule.messages) {
      if (message.type === 'text' && !message.content?.trim()) {
        return { isValid: false, error: 'Todas as mensagens de texto devem ter conteúdo' };
      }
      if (message.type !== 'text' && !message.fileUrl) {
        return { isValid: false, error: 'Todas as mensagens de mídia devem ter arquivo' };
      }
    }

    return { isValid: true };
  };

  return { validateForm };
};
