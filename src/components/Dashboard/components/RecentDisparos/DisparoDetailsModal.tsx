
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Users, Clock, Zap, Calendar, Phone, FileText } from 'lucide-react';
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

  // Parse data_json to get campaign details
  let campaignData = null;
  try {
    campaignData = disparo.data_json ? JSON.parse(disparo.data_json) : null;
  } catch (error) {
    console.log('Erro ao fazer parse do data_json:', error);
  }

  const messages = campaignData?.messages || [];
  const recipients = campaignData?.recipients || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-primary-contrast">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            Detalhes do Disparo
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
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

            {/* Mensagens Enviadas */}
            {messages.length > 0 && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary-contrast flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-400" />
                    Mensagens Enviadas
                  </h3>
                  <div className="space-y-3">
                    {messages.map((message: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                            {message.type || 'text'}
                          </Badge>
                          <span className="text-sm text-gray-400">Mensagem {index + 1}</span>
                        </div>
                        {message.content && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-400 mb-1">Conteúdo:</p>
                            <p className="text-primary-contrast bg-gray-700/50 p-2 rounded text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        )}
                        {message.caption && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-400 mb-1">Legenda:</p>
                            <p className="text-primary-contrast bg-gray-700/50 p-2 rounded text-sm whitespace-pre-wrap">
                              {message.caption}
                            </p>
                          </div>
                        )}
                        {message.fileUrl && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Arquivo:</p>
                            <p className="text-blue-400 text-sm break-all">{message.fileUrl}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Separator className="bg-gray-700" />
              </>
            )}

            {/* Números dos Destinatários */}
            {recipients.length > 0 && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary-contrast flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-400" />
                    Números dos Destinatários ({recipients.length})
                  </h3>
                  <div className="bg-gray-800/50 rounded-lg border border-gray-600 p-4">
                    <ScrollArea className="max-h-48">
                      <div className="space-y-2">
                        {recipients.map((recipient: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded">
                            <span className="text-sm text-gray-400">#{index + 1}</span>
                            <span className="text-primary-contrast font-mono">{recipient}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
                <Separator className="bg-gray-700" />
              </>
            )}

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

              {campaignData?.delay && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Delay entre Mensagens</h3>
                  <p className="text-primary-contrast">{campaignData.delay}ms</p>
                </div>
              )}

              {campaignData?.notificationPhone && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Telefone de Notificação</h3>
                  <p className="text-primary-contrast">{campaignData.notificationPhone}</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
