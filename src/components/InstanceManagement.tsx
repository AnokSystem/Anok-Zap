
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Plus, Trash2, Power, Settings, Smartphone } from 'lucide-react';
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

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    setIsLoading(true);
    try {
      const data = await evolutionApiService.getInstances();
      setInstances(data);
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
    if (!newInstanceName.trim()) return;
    
    setIsLoading(true);
    try {
      await evolutionApiService.createInstance(newInstanceName);
      setNewInstanceName('');
      await loadInstances();
      toast({
        title: "Sucesso",
        description: "Instância criada com sucesso",
      });
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

  const deleteInstance = async (instanceId: string) => {
    setIsLoading(true);
    try {
      await evolutionApiService.deleteInstance(instanceId);
      await loadInstances();
      toast({
        title: "Sucesso",
        description: "Instância removida com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover instância",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Conectado</Badge>;
      case 'close':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Desconectado</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Aguardando</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 space-y-8 p-8">
      {/* Header da Seção */}
      <div className="text-center pb-6 border-b border-white/10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">Gerenciamento de Instâncias</h3>
        </div>
        <p className="text-gray-400 text-lg">
          Configure e monitore suas instâncias do WhatsApp
        </p>
      </div>

      {/* Criar Nova Instância */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <Label className="font-semibold text-white text-lg">Nova Instância</Label>
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
            className="bg-gray-700/50 border-gray-600 text-gray-200 focus:border-purple-400"
          />
          <Button
            onClick={createInstance}
            disabled={isLoading || !newInstanceName.trim()}
            className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar
          </Button>
        </div>
      </div>

      {/* Lista de Instâncias */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <Label className="font-semibold text-white text-lg">Instâncias Ativas</Label>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700/50">
                  <TableHead className="text-gray-300">Nome</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Telefone</TableHead>
                  <TableHead className="text-gray-300 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instances.map((instance) => (
                  <TableRow key={instance.id} className="border-gray-700/50 hover:bg-gray-700/30">
                    <TableCell className="font-medium text-gray-200">
                      {instance.name}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(instance.status)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {instance.phoneNumber || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          onClick={() => deleteInstance(instance.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstanceManagement;
