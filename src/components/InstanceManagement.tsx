import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RefreshCw, Plus, Trash2, Power, Smartphone, Wifi, WifiOff, Clock, QrCode } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';

interface Instance {
  id: string;
  name: string;
  status: string;
  qrCode?: string;
  phoneNumber?: string;
}

const InstanceManagement = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newInstanceName, setNewInstanceName] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState('');
  const [connectingInstance, setConnectingInstance] = useState<string | null>(null);

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Carregando instâncias...');
      const data = await evolutionApiService.getInstances();
      console.log('✅ Instâncias carregadas:', data);
      setInstances(data);
      
      if (data.length > 0) {
        toast({
          title: "Sucesso",
          description: `${data.length} instâncias encontradas`,
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar instâncias:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar instâncias",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createInstance = async () => {
    if (!newInstanceName.trim()) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Criando instância:', newInstanceName);
      await evolutionApiService.createInstance(newInstanceName);
      setNewInstanceName('');
      await loadInstances();
      toast({
        title: "Sucesso",
        description: "Instância criada com sucesso",
      });
    } catch (error) {
      console.error('❌ Erro ao criar instância:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar instância",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInstance = async (instanceId: string) => {
    setIsLoading(true);
    try {
      console.log('🔄 Deletando instância:', instanceId);
      await evolutionApiService.deleteInstance(instanceId);
      await loadInstances();
      toast({
        title: "Sucesso",
        description: "Instância removida com sucesso",
      });
    } catch (error) {
      console.error('❌ Erro ao deletar instância:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover instância",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInstanceConnection = async (instanceId: string, currentStatus: string) => {
    setIsLoading(true);
    try {
      const isConnected = currentStatus === 'open' || currentStatus === 'conectado';
      
      if (isConnected) {
        console.log('🔄 Desconectando instância:', instanceId);
        await evolutionApiService.disconnectInstance(instanceId);
        toast({
          title: "Sucesso",
          description: "Instância desconectada",
        });
      } else {
        console.log('🔄 Conectando instância:', instanceId);
        setConnectingInstance(instanceId);
        
        // Primeiro, conecta a instância
        await evolutionApiService.connectInstance(instanceId);
        
        // Em seguida, gera o QR code
        const qrCode = await evolutionApiService.generateQrCode(instanceId);
        setCurrentQrCode(qrCode);
        setShowQrModal(true);
        
        toast({
          title: "QR Code Gerado",
          description: "Escaneie o QR code para conectar a instância",
        });
      }
      
      await loadInstances();
    } catch (error) {
      console.error('❌ Erro ao alterar conexão da instância:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar conexão da instância",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setConnectingInstance(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
      case 'conectado':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-2">
            <Wifi className="w-3 h-3" />
            Conectado
          </Badge>
        );
      case 'close':
      case 'desconectado':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-2">
            <WifiOff className="w-3 h-3" />
            Desconectado
          </Badge>
        );
      case 'connecting':
      case 'conectando':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Conectando
          </Badge>
        );
      default:
        return (
          <Badge className="bg-purple-accent/20 text-purple-accent border-purple-accent/30 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Aguardando
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
      case 'conectado':
        return <Wifi className="w-5 h-5 text-green-400" />;
      case 'close':
      case 'desconectado':
        return <WifiOff className="w-5 h-5 text-red-400" />;
      case 'connecting':
      case 'conectando':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-purple-accent" />;
    }
  };

  const isConnected = (status: string) => {
    return status === 'open' || status === 'conectado';
  };

  const closeQrModal = () => {
    setShowQrModal(false);
    setCurrentQrCode('');
  };

  return (
    <div className="space-y-8">
      {/* Header da Seção */}
      <div className="text-center pb-6 border-b border-white/10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-purple">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-primary-contrast">Gerenciamento de Instâncias</h3>
        </div>
        <p className="text-gray-400 text-lg">
          Configure e monitore suas instâncias do WhatsApp
        </p>
      </div>

      {/* Criar Nova Instância */}
      <div className="card-glass p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-purple-accent" />
          </div>
          <div>
            <Label className="font-semibold text-primary-contrast text-lg">Nova Instância</Label>
            <p className="text-sm text-gray-400 mt-1">
              Crie uma nova instância do WhatsApp
            </p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <Input
            value={newInstanceName}
            onChange={(e) => setNewInstanceName(e.target.value)}
            placeholder="Nome da instância"
            className="input-form"
          />
          <Button
            onClick={createInstance}
            disabled={isLoading || !newInstanceName.trim()}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar
          </Button>
        </div>
      </div>

      {/* Cards de Instâncias */}
      <div className="card-glass p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-purple-accent" />
            </div>
            <div>
              <Label className="font-semibold text-primary-contrast text-lg">Instâncias Ativas</Label>
              <p className="text-sm text-gray-400 mt-1">
                {instances.length} instâncias configuradas
              </p>
            </div>
          </div>
          <Button
            onClick={loadInstances}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-600/50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Carregando...' : 'Atualizar'}
          </Button>
        </div>

        {instances.length === 0 ? (
          <div className="text-center py-12">
            <Smartphone className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400 text-lg">
              {isLoading ? 'Carregando instâncias...' : 'Nenhuma instância encontrada'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instances.map((instance) => (
              <Card key={instance.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-accent/20 rounded-lg flex items-center justify-center">
                        {getStatusIcon(instance.status)}
                      </div>
                      <div>
                        <CardTitle className="text-gray-200 text-base font-semibold">
                          {instance.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-400">
                          ID: {instance.id}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-8 w-8 p-0"
                      onClick={() => deleteInstance(instance.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Status:</span>
                      {getStatusBadge(instance.status)}
                    </div>
                    
                    {instance.phoneNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Telefone:</span>
                        <span className="text-sm text-gray-200">{instance.phoneNumber}</span>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-gray-700/50">
                      <Button
                        size="sm"
                        variant={isConnected(instance.status) ? "destructive" : "default"}
                        className="w-full"
                        onClick={() => toggleInstanceConnection(instance.id, instance.status)}
                        disabled={isLoading || connectingInstance === instance.id}
                      >
                        {connectingInstance === instance.id ? (
                          <>
                            <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                            Conectando...
                          </>
                        ) : (
                          <>
                            <Power className="w-3 h-3 mr-2" />
                            {isConnected(instance.status) ? 'Desconectar' : 'Conectar'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal do QR Code */}
      <Dialog open={showQrModal} onOpenChange={closeQrModal}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-primary-contrast flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code para Conectar
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <img 
                src={currentQrCode} 
                alt="QR Code" 
                className="w-64 h-64"
              />
            </div>
            <p className="text-gray-400 text-center text-sm">
              Escaneie este QR code com o WhatsApp no seu celular para conectar a instância
            </p>
            <Button 
              onClick={closeQrModal}
              className="w-full"
              variant="outline"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstanceManagement;
