
import { useMemo } from 'react';

interface FormData {
  eventType: string;
  platform: string;
  profileName: string;
  instanceId: string;
  userRole: string;
}

export const useEditFormValidation = (formData: FormData) => {
  const isFormValid = useMemo(() => {
    return !!(
      formData.eventType &&
      formData.platform &&
      formData.profileName &&
      formData.instanceId &&
      formData.userRole
    );
  }, [formData]);

  const getValidationErrors = () => {
    const errors: string[] = [];
    
    if (!formData.eventType) errors.push('Tipo de evento é obrigatório');
    if (!formData.platform) errors.push('Plataforma é obrigatória');
    if (!formData.profileName) errors.push('Nome do perfil é obrigatório');
    if (!formData.instanceId) errors.push('ID da instância é obrigatório');
    if (!formData.userRole) errors.push('Papel do usuário é obrigatório');
    
    return errors;
  };

  return {
    isFormValid,
    getValidationErrors
  };
};
