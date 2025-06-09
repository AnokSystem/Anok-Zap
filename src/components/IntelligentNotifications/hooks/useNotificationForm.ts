
import { useFormState } from './useFormState';
import { useEditMode } from './useEditMode';
import { useMessageManagement } from './useMessageManagement';
import { useFormValidation } from './useFormValidation';
import { useFormSubmission } from './useFormSubmission';
import { useToast } from "@/hooks/use-toast";

export const useNotificationForm = (onRulesUpdate: () => void) => {
  const { toast } = useToast();
  
  const {
    newRule,
    setNewRule,
    createdWebhookUrl,
    setCreatedWebhookUrl,
    isLoading,
    setIsLoading,
    resetForm,
  } = useFormState();

  const {
    editingRule,
    handleEditRule,
    cancelEdit: baseCancelEdit,
  } = useEditMode(setNewRule, resetForm);

  const {
    addMessage,
    removeMessage,
    updateMessage,
    handleFileUpload,
  } = useMessageManagement(newRule, setNewRule, setIsLoading);

  const { validateForm } = useFormValidation();
  const { saveRule: baseSaveRule } = useFormSubmission();

  const cancelEdit = () => {
    baseCancelEdit();
    // Limpar também a URL do webhook se estivermos cancelando uma edição
    setCreatedWebhookUrl('');
  };

  const saveRule = async () => {
    const validation = validateForm(newRule);
    
    if (!validation.isValid) {
      toast({
        title: "Erro",
        description: validation.error || "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const success = await baseSaveRule(
      newRule,
      editingRule,
      setCreatedWebhookUrl,
      setIsLoading,
      resetForm,
      onRulesUpdate
    );

    // Se estamos editando e foi bem-sucedido, limpar o estado de edição
    if (success && editingRule) {
      baseCancelEdit();
    }
  };

  return {
    newRule,
    setNewRule,
    editingRule,
    createdWebhookUrl,
    setCreatedWebhookUrl,
    isLoading,
    handleEditRule,
    cancelEdit,
    addMessage,
    removeMessage,
    updateMessage,
    handleFileUpload,
    saveRule
  };
};
