
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Send, Clock, Phone } from 'lucide-react';

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
    <div className="space-y-6 p-6 bg-gradient-purple-subtle rounded-2xl border border-white/20">
      {/* Configuração de Delay */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-purple-600" />
          <Label className="font-medium">Delay Entre Mensagens: {delay[0]} segundos</Label>
        </div>
        <Slider
          value={delay}
          onValueChange={onDelayChange}
          max={60}
          min={1}
          step={1}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          Tempo de espera entre o envio de cada mensagem
        </p>
      </div>

      {/* Telefone para Notificação */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-purple-600" />
          <Label className="font-medium">Telefone para Notificação de Conclusão</Label>
        </div>
        <Input
          value={notificationPhone}
          onChange={(e) => onNotificationPhoneChange(e.target.value)}
          placeholder="+5511999999999"
          className="bg-white/50 border-white/30 focus:border-purple-400"
        />
        <p className="text-sm text-muted-foreground">
          Opcional: receba uma notificação quando a campanha terminar
        </p>
      </div>

      {/* Botão Enviar */}
      <Button
        onClick={onSendCampaign}
        disabled={isLoading}
        className="w-full gradient-purple hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] rounded-xl h-12"
      >
        <Send className="w-4 h-4 mr-2" />
        {isLoading ? 'Iniciando Campanha...' : 'Iniciar Campanha'}
      </Button>
    </div>
  );
};
