
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Send } from 'lucide-react';

interface CampaignSettingsProps {
  delay: number[];
  onDelayChange: (delay: number[]) => void;
  notificationPhone: string;
  onNotificationPhoneChange: (phone: string) => void;
  onSendCampaign: () => void;
  isLoading: boolean;
}

export const CampaignSettings: React.FC<CampaignSettingsProps> = ({
  delay,
  onDelayChange,
  notificationPhone,
  onNotificationPhoneChange,
  onSendCampaign,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      {/* Configuração de Delay */}
      <div className="space-y-2">
        <Label>Delay Entre Mensagens: {delay[0]} segundos</Label>
        <Slider
          value={delay}
          onValueChange={onDelayChange}
          max={60}
          min={1}
          step={1}
          className="w-full"
        />
      </div>

      {/* Telefone para Notificação */}
      <div className="space-y-2">
        <Label>Telefone para Notificação de Conclusão (opcional)</Label>
        <Input
          value={notificationPhone}
          onChange={(e) => onNotificationPhoneChange(e.target.value)}
          placeholder="+5511999999999"
        />
      </div>

      {/* Botão Enviar */}
      <Button
        onClick={onSendCampaign}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
      >
        <Send className="w-4 h-4 mr-2" />
        {isLoading ? 'Iniciando Campanha...' : 'Iniciar Campanha'}
      </Button>
    </div>
  );
};
