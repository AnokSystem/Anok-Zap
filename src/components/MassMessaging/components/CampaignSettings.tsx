
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Send, Clock, Phone, Zap } from 'lucide-react';

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
    <div className="space-y-8 p-8 card-futuristic">
      {/* Header da Seção */}
      <div className="text-center pb-6 border-b border-white/10">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Configurações da Campanha</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          Configure os parâmetros avançados para o disparo em massa
        </p>
      </div>

      {/* Configuração de Delay */}
      <div className="space-y-6">
        <div className="glass-morphism p-6 rounded-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <Label className="font-semibold text-foreground">Delay Entre Mensagens</Label>
              <p className="text-sm text-muted-foreground">
                Controle inteligente de velocidade
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Velocidade</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-purple-400">{delay[0]}</span>
                <span className="text-sm text-muted-foreground">segundos</span>
              </div>
            </div>
            
            <Slider
              value={delay}
              onValueChange={onDelayChange}
              max={60}
              min={1}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Rápido (1s)</span>
              <span>Moderado (30s)</span>
              <span>Seguro (60s)</span>
            </div>
          </div>
        </div>

        {/* Telefone para Notificação */}
        <div className="glass-morphism p-6 rounded-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <Label className="font-semibold text-foreground">Notificação de Conclusão</Label>
              <p className="text-sm text-muted-foreground">
                Receba um alerta quando a campanha terminar
              </p>
            </div>
          </div>
          
          <Input
            value={notificationPhone}
            onChange={(e) => onNotificationPhoneChange(e.target.value)}
            placeholder="+5511999999999"
            className="bg-background/50 border-white/20 focus:border-purple-400 focus:ring-purple-400/20 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Botão de Envio Futurístico */}
      <div className="pt-6">
        <Button
          onClick={onSendCampaign}
          disabled={isLoading}
          className="w-full btn-futuristic text-white font-semibold text-lg h-14 group"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isLoading ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`}>
              <Send className="w-4 h-4" />
            </div>
            <span>{isLoading ? 'Iniciando Campanha...' : 'Iniciar Campanha'}</span>
          </div>
          
          {!isLoading && (
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-purple-600/20 to-purple-800/20"></div>
          )}
        </Button>
        
        {isLoading && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-purple-400">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Processando mensagens...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
