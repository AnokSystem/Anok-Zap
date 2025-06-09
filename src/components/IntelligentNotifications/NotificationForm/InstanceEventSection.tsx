
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NotificationRule {
  instanceId: string;
  eventType: string;
  userRole: string;
}

interface InstanceEventSectionProps {
  newRule: Partial<NotificationRule>;
  setNewRule: (rule: Partial<NotificationRule> | ((prev: Partial<NotificationRule>) => Partial<NotificationRule>)) => void;
  instances: any[];
}

export const InstanceEventSection = ({ newRule, setNewRule, instances }: InstanceEventSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <Label className="text-gray-200 font-medium text-sm">Instância WhatsApp *</Label>
        <Select
          value={newRule.instanceId}
          onValueChange={(value) => setNewRule(prev => ({ ...prev, instanceId: value }))}
        >
          <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 focus:border-purple-accent h-10">
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
          <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 focus:border-purple-accent h-10">
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
          <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 focus:border-purple-accent h-10">
            <SelectValue placeholder="Selecione seu papel" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="producer" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Produtor</SelectItem>
            <SelectItem value="affiliate" className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700">Afiliado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
