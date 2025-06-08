
import React from 'react';
import { useNotificationData } from './hooks/useNotificationData';
import { useNotificationForm } from './hooks/useNotificationForm';
import { NotificationHeader } from './NotificationHeader';
import { NotificationForm } from './NotificationForm';
import { WebhookDisplay } from './WebhookDisplay';
import { ActiveNotificationsList } from './ActiveNotificationsList';

const IntelligentNotifications = () => {
  const {
    rules,
    instances,
    isLoading: dataLoading,
    setIsLoading: setDataLoading,
    loadRules,
    deleteRule
  } = useNotificationData();

  const {
    newRule,
    setNewRule,
    editingRule,
    createdWebhookUrl,
    setCreatedWebhookUrl,
    isLoading: formLoading,
    handleEditRule,
    cancelEdit,
    addMessage,
    removeMessage,
    updateMessage,
    handleFileUpload,
    saveRule
  } = useNotificationForm(loadRules);

  const isLoading = dataLoading || formLoading;

  return (
    <div className="space-y-8">
      {/* Header da Seção */}
      <NotificationHeader isEditing={!!editingRule} />

      {/* URL do Webhook criado */}
      {createdWebhookUrl && (
        <WebhookDisplay
          webhookUrl={createdWebhookUrl}
          onClose={() => setCreatedWebhookUrl('')}
        />
      )}

      {/* Formulário de Nova Regra */}
      <NotificationForm
        newRule={newRule}
        setNewRule={setNewRule}
        instances={instances}
        isLoading={isLoading}
        onSave={saveRule}
        onAddMessage={addMessage}
        onRemoveMessage={removeMessage}
        onUpdateMessage={updateMessage}
        onFileUpload={handleFileUpload}
        isEditing={!!editingRule}
        onCancelEdit={cancelEdit}
      />

      {/* Lista de Regras Existentes */}
      <ActiveNotificationsList
        rules={rules}
        onDeleteRule={deleteRule}
        onEditRule={handleEditRule}
      />
    </div>
  );
};

export default IntelligentNotifications;
