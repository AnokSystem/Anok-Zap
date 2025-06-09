
import React from 'react';
import { Message } from './types';
import { MessageEditor } from './MessageEditor';
import { FormHeader } from './NotificationForm/FormHeader';
import { InstanceEventSection } from './NotificationForm/InstanceEventSection';
import { PlatformProfileSection } from './NotificationForm/PlatformProfileSection';
import { FormActions } from './NotificationForm/FormActions';

interface NotificationRule {
  instanceId: string;
  eventType: string;
  userRole: string;
  platform: string;
  profileName: string;
  messages: Message[];
}

interface NotificationFormProps {
  newRule: Partial<NotificationRule>;
  setNewRule: (rule: Partial<NotificationRule> | ((prev: Partial<NotificationRule>) => Partial<NotificationRule>)) => void;
  instances: any[];
  isLoading: boolean;
  onSave: () => void;
  onAddMessage: () => void;
  onRemoveMessage: (messageId: string) => void;
  onUpdateMessage: (messageId: string, updates: Partial<Message>) => void;
  onFileUpload: (messageId: string, file: File) => void;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

export const NotificationForm = ({ 
  newRule, 
  setNewRule, 
  instances, 
  isLoading, 
  onSave, 
  onAddMessage, 
  onRemoveMessage, 
  onUpdateMessage, 
  onFileUpload,
  isEditing = false,
  onCancelEdit
}: NotificationFormProps) => {
  return (
    <div className="card-glass p-6">
      <FormHeader isEditing={isEditing} onCancelEdit={onCancelEdit} />

      <div className="space-y-6">
        <InstanceEventSection 
          newRule={newRule}
          setNewRule={setNewRule}
          instances={instances}
        />

        <PlatformProfileSection 
          newRule={newRule}
          setNewRule={setNewRule}
        />

        <MessageEditor
          messages={newRule.messages || []}
          onAddMessage={onAddMessage}
          onRemoveMessage={onRemoveMessage}
          onUpdateMessage={onUpdateMessage}
          onFileUpload={onFileUpload}
        />

        <FormActions
          newRule={newRule}
          isEditing={isEditing}
          isLoading={isLoading}
          onSave={onSave}
          onCancelEdit={onCancelEdit}
        />
      </div>
    </div>
  );
};
