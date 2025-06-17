
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Send, Clock, Phone, Zap, Settings, Shield } from 'lucide-react';

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
    <div className="space-y-8 p-8 card-glass rounded-2xl">
      {/* Header da Seção */}
      <div className="text-center pb-6 border-b border-white/10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-primary-contrast">Configurações da Campanha</h3>
        </div>
        <p className="text-gray-400 text-lg">
          Configure os parâmetros avançados para o disparo em massa
        </p>
      </div>

      {/* Configuração de Delay */}
      <div className="space-y-8">
        <div className="card-modern p-6 rounded-xl border-gradient">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <Label className="font-semibold text-foreground text-lg">Delay Entre Mensagens</Label>
              <p className="text-sm text-gray-400 mt-1">
                Controle inteligente de velocidade para maior segurança
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Velocidade</span>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-3 rounded-2xl border-3 border-purple-500 shadow-xl">
                  <span className="text-4xl font-bold">{delay[0]}</span>
                  <span className="text-lg ml-3 opacity-90 font-medium">segundos</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Slider
                value={delay}
                onValueChange={onDelayChange}
                max={60}
                min={1}
                step={1}
                className="w-full [&_.relative]:h-3 [&_.relative_.absolute]:bg-gradient-to-r [&_.relative_.absolute]:from-purple-500 [&_.relative_.absolute]:to-purple-700 [&_.relative_.absolute]:border-2 [&_.relative_.absolute]:border-purple-400 [&_.relative_.absolute]:shadow-lg [&_.relative_.absolute]:rounded-full [&_.block]:w-6 [&_.block]:h-6 [&_.block]:border-3 [&_.block]:border-purple-400 [&_.block]:bg-white [&_.block]:shadow-xl [&_.block]:ring-2 [&_.block]:ring-purple-300/50"
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Rápido (1s)</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Moderado (30s)</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Seguro (60s)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telefone para Notificação */}
        <div className="card-modern p-6 rounded-xl border-gradient">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <Label className="font-semibold text-foreground text-lg">Notificação de Conclusão</Label>
              <p className="text-sm text-gray-400 mt-1">
                Receba um alerta quando a campanha terminar
              </p>
            </div>
          </div>
          
          <Input
            value={notificationPhone}
            onChange={(e) => onNotificationPhoneChange(e.target.value)}
            placeholder="+5511999999999"
            className="input-modern text-lg"
          />
        </div>
      </div>

      {/* Botão de Envio */}
      <div className="pt-6">
        <Button
          onClick={onSendCampaign}
          disabled={isLoading}
          className="w-full btn-primary text-white font-semibold text-lg h-16 group relative overflow-hidden"
        >
          <div className="flex items-center justify-center space-x-3 relative z-10">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isLoading ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`}>
              <Send className="w-5 h-5" />
            </div>
            <span className="text-lg font-semibold">
              {isLoading ? 'Iniciando Campanha...' : 'Iniciar Campanha'}
            </span>
          </div>
          
          {!isLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-800/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          )}
        </Button>
        
        {isLoading && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-3 text-sm text-purple-400">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Processando mensagens...</span>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-200"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
