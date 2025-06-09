
import { NotificationRule } from '../types';

export const useFormValidation = () => {
  const validateForm = (rule: Partial<NotificationRule>): { isValid: boolean; error?: string } => {
    if (!rule.eventType) {
      return { isValid: false, error: 'Tipo de evento é obrigatório' };
    }
    
    if (!rule.instanceId) {
      return { isValid: false, error: 'ID da instância é obrigatório' };
    }
    
    if (!rule.userRole) {
      return { isValid: false, error: 'Função do usuário é obrigatória' };
    }
    
    if (!rule.platform) {
      return { isValid: false, error: 'Plataforma é obrigatória' };
    }
    
    if (!rule.profileName) {
      return { isValid: false, error: 'Nome do perfil é obrigatório' };
    }
    
    if (!rule.messages?.length) {
      return { isValid: false, error: 'Pelo menos uma mensagem é obrigatória' };
    }

    return { isValid: true };
  };

  return {
    validateForm,
  };
};
