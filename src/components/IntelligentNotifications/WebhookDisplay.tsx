
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Zap, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface WebhookDisplayProps {
  webhookUrl: string;
  onClose: () => void;
}

export const WebhookDisplay: React.FC<WebhookDisplayProps> = ({ webhookUrl, onClose }) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Copiado!",
      description: "URL copiada para a área de transferência",
    });
  };

  const openWebhook = () => {
    window.open(webhookUrl, '_blank');
    toast({
      title: "Webhook Aberto",
      description: "URL do webhook aberta em nova aba",
    });
  };

  return (
    <div className="card-glass p-6 border-green-500/30">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h4 className="font-semibold text-primary-contrast text-lg">Notificação Criada!</h4>
          <p className="text-sm text-gray-400 mt-1">
            Use esta URL no webhook da plataforma
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <Label className="text-gray-200 font-medium text-sm">URL do Webhook</Label>
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/50 flex items-center justify-between">
          <p className="text-sm text-gray-300 break-all">
            {webhookUrl}
          </p>
          <div className="flex space-x-2 ml-2">
            <Button
              onClick={copyToClipboard}
              size="sm"
              variant="outline"
              className="bg-gray-700/50 border-gray-600 text-gray-200"
            >
              Copiar
            </Button>
            <Button
              onClick={openWebhook}
              size="sm"
              variant="outline"
              className="bg-blue-600/20 border-blue-500 text-blue-400 hover:bg-blue-600/30"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Abrir
            </Button>
          </div>
        </div>
        <Button
          onClick={onClose}
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-gray-200"
        >
          Fechar
        </Button>
      </div>
    </div>
  );
};
