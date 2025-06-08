
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Zap } from 'lucide-react';
import { Message } from './types';
import { MessageEditor } from './MessageEditor';

interface NotificationFormProps {
  newRule: any;
  setNewRule: (rule: any) => void;
  instances: any[];
  isLoading: boolean;
  onSave: () => void;
  onAddMessage: () => void;
  onRemoveMessage: (messageId: string) => void;
  onUpdateMessage: (messageId: string, updates: Partial<Message>) => void;
  onFileUpload: (messageId: string, file: File) => void;
}

export const NotificationForm: React.FC<NotificationFormProps> = ({
  newRule,
  setNewRule,
  instances,
  isLoading,
  onSave,
  onAddMessage,
  onRemoveMessage,
  onUpdateMessage,
  onFileUpload
}) => {
  return (
    <div className="card-glass p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
          <Plus className="w-5 h-5 text-purple-accent" />
        </div>
        <div>
          <h4 className="font-semibold text-primary-contrast text-lg">Nova Notificação</h4>
          <p className="text-sm text-gray-400 mt-1">
            Configure uma nova regra de notificação automática
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Primeira linha - Instância, Tipo de Evento e Você é */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-200 font-medium text-sm">Instância WhatsApp *</Label>
            <Select
              value={newRule.instanceId}
              onValueChange={(value) => setNewRule(prev => ({ ...prev, instanceId: value }))}
            >
              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 focus:border-purple-accent">
                <SelectValue placeholder="Selecione a instância" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {instances.map((instance) => (
                  <SelectItem key={instance.id} value={instance.id} className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">
                    {instance.name} ({instance.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200 font-medium text-sm">Tipo de Evento *</Label>
            <Select
              value={newRule.eventType}
              onValueChange={(value) => setNewRule(prev => ({ ...prev, eventType: value }))}
            >
              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 focus:border-purple-accent">
                <SelectValue placeholder="Selecione o evento" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="purchase-approved" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Compra Aprovada</SelectItem>
                <SelectItem value="awaiting-payment" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Aguardando Pagamento</SelectItem>
                <SelectItem value="cart-abandoned" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Carrinho Abandonado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200 font-medium text-sm">Você é *</Label>
            <Select
              value={newRule.userRole}
              onValueChange={(value) => setNewRule(prev => ({ ...prev, userRole: value }))}
            >
              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 focus:border-purple-accent">
                <SelectValue placeholder="Selecione seu papel" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="producer" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Produtor</SelectItem>
                <SelectItem value="affiliate" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Afiliado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Segunda linha - Plataforma e Nome do Perfil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-200 font-medium text-sm">Plataforma *</Label>
            <Select
              value={newRule.platform}
              onValueChange={(value) => setNewRule(prev => ({ ...prev, platform: value }))}
            >
              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 focus:border-purple-accent">
                <SelectValue placeholder="Selecione a plataforma" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="hotmart" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Hotmart</SelectItem>
                <SelectItem value="braip" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Braip</SelectItem>
                <SelectItem value="kiwfy" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Kiwfy</SelectItem>
                <SelectItem value="monetize" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Monetize</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200 font-medium text-sm">Nome do Perfil *</Label>
            <Input
              value={newRule.profileName || ''}
              onChange={(e) => setNewRule(prev => ({ ...prev, profileName: e.target.value }))}
              placeholder="Nome cadastrado na plataforma"
              className="input-form"
            />
          </div>
        </div>

        {/* Editor de Mensagens */}
        <MessageEditor
          messages={newRule.messages || []}
          onAddMessage={onAddMessage}
          onRemoveMessage={onRemoveMessage}
          onUpdateMessage={onUpdateMessage}
          onFileUpload={onFileUpload}
        />

        {/* Botão Salvar */}
        <div className="pt-4">
          <Button
            onClick={onSave}
            disabled={isLoading}
            className="w-full btn-primary h-12"
          >
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>{isLoading ? 'Criando...' : 'Criar Notificação'}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};
