
import React from 'react';
import { Label } from "@/components/ui/label";
import { MessageEditor } from '../../IntelligentNotifications/MessageEditor';
import { Message } from '../../IntelligentNotifications/types';

interface MessageEditingSectionProps {
  messages: Message[];
  onAddMessage: () => void;
  onRemoveMessage: (messageId: string) => void;
  onUpdateMessage: (messageId: string, updates: Partial<Message>) => void;
  onFileUpload: (messageId: string, file: File) => Promise<void>;
}

export const MessageEditingSection = ({
  messages,
  onAddMessage,
  onRemoveMessage,
  onUpdateMessage,
  onFileUpload
}: MessageEditingSectionProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-gray-200 font-medium text-sm">Configuração das Mensagens</Label>
      <MessageEditor
        messages={messages}
        onAddMessage={onAddMessage}
        onRemoveMessage={onRemoveMessage}
        onUpdateMessage={onUpdateMessage}
        onFileUpload={onFileUpload}
      />
    </div>
  );
};
