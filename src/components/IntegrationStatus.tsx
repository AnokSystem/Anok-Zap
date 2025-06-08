
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Activity, Server, Database } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface IntegrationItem {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'warning';
  description: string;
  lastCheck: string;
  details?: string;
}

const IntegrationStatus = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkIntegrations();
  }, []);

  const checkIntegrations = async () => {
    setIsLoading(true);
    try {
      // Simular verificação de integrações
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockIntegrations: IntegrationItem[] = [
        {
          id: '1',
          name: 'Evolution API',
          status: 'connected',
          description: 'API do WhatsApp funcionando normalmente',
          lastCheck: new Date().toLocaleString('pt-BR'),
          details: '15 instâncias ativas'
        },
        {
          id: '2',
          name: 'NocoDB',
          status: 'connected',
          description: 'Banco de dados operacional',
          lastCheck: new Date().toLocaleString('pt-BR'),
          details: '1.2GB de dados armazenados'
        },
        {
          id: '3',
          name: 'MinIO Storage',
          status: 'warning',
          description: 'Armazenamento com alta utilização',
          lastCheck: new Date().toLocaleString('pt-BR'),
          details: '85% de capacidade utilizada'
        },
        {
          id: '4',
          name: 'Hotmart Webhook',
          status: 'connected',
          description: 'Recebendo eventos automaticamente',
          lastCheck: new Date().toLocaleString('pt-BR'),
          details: '127 eventos processados hoje'
        }
      ];

      setIntegrations(mockIntegrations);
      
      toast({
        title: "Sucesso",
        description: "Status das integrações atualizado",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao verificar integrações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Conectado</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Desconectado</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Atenção</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Desconhecido</Badge>;
    }
  };

  const getServiceIcon = (name: string) => {
    if (name.includes('API')) return <Activity className="w-6 h-6" />;
    if (name.includes('DB') || name.includes('NocoDB')) return <Database className="w-6 h-6" />;
    return <Server className="w-6 h-6" />;
  };

  return (
    <div className="space-y-8">
      {/* Header da Seção */}
      <div className="text-center pb-6 border-b border-white/10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-purple">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-primary-contrast">Status das Integrações</h3>
        </div>
        <p className="text-gray-400 text-lg">
          Monitore o status de todos os serviços conectados
        </p>
      </div>

      {/* Controles */}
      <div className="card-glass p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-purple-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-primary-contrast text-lg">Verificação de Status</h4>
              <p className="text-sm text-gray-400 mt-1">
                Última verificação: {integrations[0]?.lastCheck || 'Nunca'}
              </p>
            </div>
          </div>
          <Button
            onClick={checkIntegrations}
            disabled={isLoading}
            className="btn-primary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Verificando...' : 'Atualizar Status'}
          </Button>
        </div>
      </div>

      {/* Lista de Integrações */}
      <div className="space-y-4">
        {integrations.length === 0 ? (
          <div className="card-glass p-12 text-center">
            <Server className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400 text-lg">
              {isLoading ? 'Verificando integrações...' : 'Nenhuma integração configurada'}
            </p>
          </div>
        ) : (
          integrations.map((integration) => (
            <div key={integration.id} className="card-glass p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-300">
                    {getServiceIcon(integration.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-primary-contrast">{integration.name}</h3>
                      {getStatusBadge(integration.status)}
                    </div>
                    <p className="text-gray-400 mb-1">{integration.description}</p>
                    {integration.details && (
                      <p className="text-sm text-purple-accent">{integration.details}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Última verificação: {integration.lastCheck}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(integration.status)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resumo do Status */}
      {integrations.length > 0 && (
        <div className="card-glass p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-primary-contrast text-lg">Resumo Geral</h4>
              <p className="text-sm text-gray-400 mt-1">
                Estado atual dos serviços conectados
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-medium text-emerald-400">Conectados</span>
              </div>
              <p className="text-2xl font-bold text-primary-contrast">
                {integrations.filter(i => i.status === 'connected').length}
              </p>
            </div>
            
            <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="font-medium text-yellow-400">Atenção</span>
              </div>
              <p className="text-2xl font-bold text-primary-contrast">
                {integrations.filter(i => i.status === 'warning').length}
              </p>
            </div>
            
            <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="font-medium text-red-400">Desconectados</span>
              </div>
              <p className="text-2xl font-bold text-primary-contrast">
                {integrations.filter(i => i.status === 'disconnected').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationStatus;
