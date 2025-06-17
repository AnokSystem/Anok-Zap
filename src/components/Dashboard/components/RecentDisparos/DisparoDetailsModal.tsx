
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Users, Clock, Zap, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusBadge } from './StatusBadge';
import { getProgressPercentage } from './utils';

interface DisparoDetailsModalProps {
  disparo: any;
  isOpen: boolean;
  onClose: () => void;
}

export const DisparoDetailsModal = ({ disparo, isOpen, onClose }: DisparoDetailsModalProps) => {
  if (!disparo) return null;

  const progressPercentage = getProgressPercentage(disparo);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-primary-contrast">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            Detalhes do Disparo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Nome da Campanha</h3>
              <p className="text-primary-contrast font-semibold">{disparo.campaignName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
              <StatusBadge status={disparo.status} />
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary-contrast">{disparo.recipientCount}</p>
              <p className="text-sm text-gray-400">Destinatários</p>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <Zap className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-400">{disparo.sentCount || 0}</p>
              <p className="text-sm text-gray-400">Enviados</p>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-400">{progressPercentage}%</p>
              <p className="text-sm text-gray-400">Progresso</p>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-400">{disparo.messageType}</p>
              <p className="text-sm text-gray-400">Tipo</p>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Informações Técnicas */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Instância</h3>
              <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                {disparo.instanceName}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Data de Criação</h3>
                <p className="text-primary-contrast flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {format(new Date(disparo.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">ID da Campanha</h3>
                <p className="text-primary-contrast font-mono text-sm bg-gray-800/50 px-2 py-1 rounded">
                  {disparo.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
