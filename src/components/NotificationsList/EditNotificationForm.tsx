
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Notification } from './types';
import { FormHeader } from './EditNotificationForm/FormHeader';
import { BasicFieldsSection } from './EditNotificationForm/BasicFieldsSection';
import { UserRoleSection } from './EditNotificationForm/UserRoleSection';
import { MessageEditingSection } from './EditNotificationForm/MessageEditingSection';
import { FormActions } from './EditNotificationForm/FormActions';
import { useEditFormValidation } from './EditNotificationForm/useEditFormValidation';
import { useEditFormData } from './EditNotificationForm/useEditFormData';
import { useEditFormMessages } from './EditNotificationForm/useEditFormMessages';
import { useToast } from "@/hooks/use-toast";

interface EditNotificationFormProps {
  notification: Notification;
  onSave: (updatedData: any) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EditNotificationForm = ({ 
  notification, 
  onSave, 
  onCancel, 
  isLoading = false 
}: EditNotificationFormProps) => {
  const [isFormLoading, setIsFormLoading] = useState(false);
  const { toast } = useToast();
  
  const { formData, setFormData, handleFieldUpdate, handleUserRoleUpdate } = useEditFormData(notification);
  const { isFormValid, getValidationErrors } = useEditFormValidation(formData);
  const { 
    handleAddMessage, 
    handleRemoveMessage, 
    handleUpdateMessage, 
    handleMessageFileUpload 
  } = useEditFormMessages(formData, setFormData, setIsFormLoading);

  const handleSave = async () => {
    try {
      console.log('💾 Iniciando salvamento da edição...');
      console.log('📋 Dados do formulário a serem salvos:', formData);
      console.log('🔍 Validação do formulário:', { isFormValid });
      
      if (!isFormValid) {
        const errors = getValidationErrors();
        console.error('❌ Formulário inválido:', errors);
        toast({
          title: "❌ Formulário Inválido",
          description: errors.join(', '),
          variant: "destructive",
        });
        return;
      }

      setIsFormLoading(true);
      
      // Preparar dados no formato correto para o serviço de salvamento
      const dataToSave = {
        eventType: formData.eventType,
        platform: formData.platform,
        profileName: formData.profileName,
        instanceId: formData.instanceId, // Manter como instanceId - será convertido para instance no serviço
        userRole: formData.userRole,
        messages: formData.messages
          .filter(msg => (msg.content && msg.content.trim() !== '') || msg.fileUrl)
          .map(msg => ({
            id: msg.id,
            type: msg.type,
            content: msg.content || '',
            delay: msg.delay || 0,
            ...(msg.fileUrl && { fileUrl: msg.fileUrl }),
            ...(msg.file && { file: msg.file })
          }))
      };

      console.log('📤 Dados formatados para salvamento:', dataToSave);
      console.log('🔑 ID da notificação sendo editada:', notification.ID);
      console.log('📊 Número de mensagens válidas:', dataToSave.messages.length);
      
      const success = await onSave(dataToSave);
      
      if (success) {
        console.log('✅ Edição salva com sucesso pelo formulário');
        toast({
          title: "✅ Sucesso",
          description: "Notificação atualizada com sucesso!",
        });
      } else {
        console.error('❌ Falha ao salvar edição pelo formulário');
        toast({
          title: "❌ Erro",
          description: "Falha ao salvar as alterações",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao salvar edição:', error);
      toast({
        title: "❌ Erro",
        description: "Erro inesperado ao salvar",
        variant: "destructive",
      });
    } finally {
      setIsFormLoading(false);
    }
  };

  const currentIsLoading = isLoading || isFormLoading;

  return (
    <Card className="border-blue-500/50 bg-blue-500/10">
      <FormHeader notification={notification} onCancel={onCancel} />
      <CardContent className="space-y-6">
        <BasicFieldsSection 
          formData={formData}
          onUpdate={handleFieldUpdate}
        />

        <UserRoleSection 
          userRole={formData.userRole}
          onUpdate={handleUserRoleUpdate}
        />

        <MessageEditingSection
          messages={formData.messages}
          onAddMessage={handleAddMessage}
          onRemoveMessage={handleRemoveMessage}
          onUpdateMessage={handleUpdateMessage}
          onFileUpload={handleMessageFileUpload}
        />

        <FormActions
          onSave={handleSave}
          onCancel={onCancel}
          isLoading={currentIsLoading}
          isFormValid={isFormValid}
        />
      </CardContent>
    </Card>
  );
};
