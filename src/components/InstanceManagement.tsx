
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Plus, Trash2, RefreshCcw, QrCode } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { nocodbService } from '@/services/nocodb';

interface Instance {
  id: string;
  name: string;
  status: string;
  creationDate: string;
}

const InstanceManagement = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newInstanceName, setNewInstanceName] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [selectedInstance, setSelectedInstance] = useState('');
  const [notificationPhone, setNotificationPhone] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    setIsLoading(true);
    try {
      const instancesData = await evolutionApiService.getInstances();
      setInstances(instancesData);
    } catch (error) {
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
    if (!newInstanceName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite um nome para a instância",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newInstance = await evolutionApiService.createInstance(newInstanceName);
      
      // Salvar no NocoDB
      await nocodbService.saveInstance(newInstance);
      
      setInstances([...instances, newInstance]);
      setNewInstanceName('');
      setShowCreateDialog(false);
      
      toast({
        title: "Sucesso",
        description: "Instância criada com sucesso",
      });

      // Enviar notificação se telefone fornecido
      if (notificationPhone) {
        await evolutionApiService.sendMessage(
          newInstance.id,
          notificationPhone,
          `Instância ${newInstanceName} criada com sucesso.`
        );
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar instância",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQrCode = async (instanceId: string) => {
    setIsLoading(true);
    try {
      const qrCodeData = await evolutionApiService.generateQrCode(instanceId);
      setQrCode(qrCodeData);
      setSelectedInstance(instanceId);
      setShowQrDialog(true);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar código QR",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectInstance = async () => {
    if (!selectedInstance) return;
    
    setIsLoading(true);
    try {
      await evolutionApiService.connectInstance(selectedInstance);
      setShowQrDialog(false);
      await loadInstances(); // Atualizar instâncias
      
      toast({
        title: "Sucesso",
        description: "Instância conectada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao conectar instância",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInstance = async (instanceId: string, instanceName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a instância "${instanceName}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await evolutionApiService.deleteInstance(instanceId);
      setInstances(instances.filter(instance => instance.id !== instanceId));
      
      toast({
        title: "Sucesso",
        description: "Instância excluída com sucesso",
      });

      // Enviar notificação se telefone fornecido
      if (notificationPhone) {
        // Usar uma instância diferente para enviar a notificação
        const availableInstance = instances.find(i => i.id !== instanceId && i.status === 'connected');
        if (availableInstance) {
          await evolutionApiService.sendMessage(
            availableInstance.id,
            notificationPhone,
            `Instância ${instanceName} excluída com sucesso.`
          );
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir instância",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
      case 'conectado':
        return 'text-green-600 bg-green-100';
      case 'disconnected':
      case 'desconectado':
        return 'text-red-600 bg-red-100';
      case 'connecting':
      case 'conectando':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const translateStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'connecting':
        return 'Conectando';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Gerenciamento de Instâncias</span>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Instância
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Instância WhatsApp</DialogTitle>
                  <DialogDescription>
                    Crie uma nova instância WhatsApp para envio de mensagens
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome da Instância</Label>
                    <Input
                      value={newInstanceName}
                      onChange={(e) => setNewInstanceName(e.target.value)}
                      placeholder="Digite o nome da instância"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone para Notificação (opcional)</Label>
                    <Input
                      value={notificationPhone}
                      onChange={(e) => setNotificationPhone(e.target.value)}
                      placeholder="+5511999999999"
                    />
                  </div>
                  <Button
                    onClick={createInstance}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Criando...' : 'Criar Instância'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Gerencie suas instâncias WhatsApp para envio de mensagens
          </CardDescription>
        </CardHeader>
        <CardContent>
          {instances.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma instância encontrada. Crie sua primeira instância para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Instância</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instances.map((instance) => (
                  <TableRow key={instance.id}>
                    <TableCell className="font-medium">{instance.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                        {translateStatus(instance.status)}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(instance.creationDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateQrCode(instance.id)}
                          disabled={isLoading}
                          title="Gerar QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteInstance(instance.id, instance.name)}
                          disabled={isLoading}
                          title="Excluir Instância"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog do QR Code */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar Instância WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie este código QR com seu WhatsApp para conectar a instância
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {qrCode && (
              <div className="flex justify-center p-4 bg-white border rounded-lg">
                <img src={qrCode} alt="Código QR" className="w-64 h-64" />
              </div>
            )}
            <div className="flex space-x-2">
              <Button
                onClick={() => generateQrCode(selectedInstance)}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Atualizar QR
              </Button>
              <Button
                onClick={connectInstance}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Conectando...' : 'Conectar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstanceManagement;
