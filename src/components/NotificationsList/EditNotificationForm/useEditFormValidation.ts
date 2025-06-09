
import { useMemo } from 'react';

interface FormData {
  eventType: string;
  platform: string;
  profileName: string;
  instanceId: string;
  userRole: string;
  messages: any[];
}

export const useEditFormValidation = (formData: FormData) => {
  const isFormValid = useMemo(() => {
    const hasRequiredFields = !!(
      formData.eventType &&
      formData.platform &&
      formData.profileName &&
      formData.instanceId &&
      formData.userRole
    );

    // Verificar se há pelo menos uma mensagem válida
    const hasValidMessage = formData.messages && formData.messages.length > 0 && 
      formData.messages.some(msg => 
        (msg.content && msg.content.trim() !== '') || msg.fileUrl
      );

    console.log('🔍 Validação do formulário de edição:', {
      hasRequiredFields,
      hasValidMessage,
      isValid: hasRequiredFields && hasValidMessage,
      formData: {
        eventType: formData.eventType,
        platform: formData.platform,
        profileName: formData.profileName,
        instanceId: formData.instanceId,
        userRole: formData.userRole,
        messagesCount: formData.messages?.length || 0,
        validMessages: formData.messages?.filter(msg => 
          (msg.content && msg.content.trim() !== '') || msg.fileUrl
        ).length || 0
      }
    });

    return hasRequiredFields && hasValidMessage;
  }, [formData]);

  const getValidationErrors = () => {
    const errors: string[] = [];
    
    if (!formData.eventType) errors.push('Tipo de evento é obrigatório');
    if (!formData.platform) errors.push('Plataforma é obrigatória');
    if (!formData.profileName) errors.push('Nome do perfil é obrigatório');
    if (!formData.instanceId) errors.push('ID da instância é obrigatório');
    if (!formData.userRole) errors.push('Papel do usuário é obrigatório');
    
    const hasValidMessage = formData.messages && formData.messages.length > 0 && 
      formData.messages.some(msg => 
        (msg.content && msg.content.trim() !== '') || msg.fileUrl
      );
    if (!hasValidMessage) errors.push('Pelo menos uma mensagem com conteúdo é obrigatória');
    
    console.log('❌ Erros de validação encontrados:', errors);
    return errors;
  };

  return {
    isFormValid,
    getValidationErrors
  };
};
