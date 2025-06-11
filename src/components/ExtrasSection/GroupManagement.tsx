
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Plus, Settings, Link, Search, Edit, Smartphone, Send, Save, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';

const GroupManagement = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groupMessage, setGroupMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    isPrivate: false
  });

  useEffect(() => {
    loadInstances();
  }, []);

  useEffect(() => {
    if (selectedInstance) {
      loadGroups();
    }
  }, [selectedInstance]);

  const loadInstances = async () => {
    try {
      const instanceList = await evolutionApiService.getInstances();
      setInstances(instanceList);
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
    }
  };

  const loadGroups = async () => {
    if (!selectedInstance) return;
    
    try {
      const groupList = await evolutionApiService.getGroups(selectedInstance);
      setGroups(groupList);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = () => {
    if (!selectedInstance) {
      toast({
        title: "Erro",
        description: "Selecione uma instância",
        variant: "destructive"
      });
      return;
    }

    if (!newGroupData.name) {
      toast({
        title: "Erro",
        description: "Nome do grupo é obrigatório",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Grupo Criado",
      description: `Grupo "${newGroupData.name}" criado com sucesso!`,
    });
    setNewGroupData({ name: '', description: '', isPrivate: false });
  };

  const handleSendMessage = () => {
    if (!selectedInstance) {
      toast({
        title: "Erro",
        description: "Selecione uma instância",
        variant: "destructive"
      });
      return;
    }

    if (!selectedGroup || !groupMessage) {
      toast({
        title: "Erro",
        description: "Selecione um grupo e digite uma mensagem",
        variant: "destructive"
      });
      return;
    }

    const group = groups.find(g => g.id === selectedGroup);
    toast({
      title: "Mensagem Enviada",
      description: `Mensagem enviada para o grupo "${group?.name}"`,
    });
    setGroupMessage('');
  };

  const copyGroupLink = (link: string, groupName: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copiado",
      description: `Link do grupo "${groupName}" copiado!`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Seleção de Instância */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Selecionar Instância
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-gray-300">Instância Ativa</Label>
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue placeholder="Escolha uma instância" />
                </SelectTrigger>
                <SelectContent>
                  {instances.map((instance) => (
                    <SelectItem key={instance.id} value={instance.id}>
                      <div className="flex items-center gap-2">
                        {instance.name}
                        <span className={`text-xs px-2 py-1 rounded ${
                          instance.status === 'conectado' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {instance.status}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              onClick={loadGroups}
              className="bg-gray-800 border-gray-600 mt-6"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Criar Novo Grupo */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Criar Novo Grupo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Nome do Grupo</Label>
              <Input
                value={newGroupData.name}
                onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
                placeholder="Digite o nome do grupo"
                className="bg-gray-800 border-gray-600"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="private"
                checked={newGroupData.isPrivate}
                onCheckedChange={(checked) => setNewGroupData({ ...newGroupData, isPrivate: !!checked })}
              />
              <Label htmlFor="private" className="text-gray-300">Grupo Privado</Label>
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Descrição</Label>
            <Textarea
              value={newGroupData.description}
              onChange={(e) => setNewGroupData({ ...newGroupData, description: e.target.value })}
              placeholder="Descrição do grupo (opcional)"
              className="bg-gray-800 border-gray-600 text-gray-200"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleCreateGroup} className="btn-primary flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Criar Grupo
            </Button>
            <Button variant="outline" className="flex-1 bg-gray-800 border-gray-600">
              <Save className="w-4 h-4 mr-2" />
              Salvar Rascunho
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gerenciar Grupos Existentes */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Grupos ({filteredGroups.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Buscar Grupos</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar grupos..."
                className="bg-gray-800 border-gray-600 pl-10"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredGroups.map((group) => (
              <div key={group.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-200">{group.name}</h4>
                  <span className="text-sm text-gray-400">ID: {group.id.slice(0, 15)}...</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="bg-gray-800 border-gray-600">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="bg-gray-800 border-gray-600">
                    <Settings className="w-4 h-4 mr-1" />
                    Configurações
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-gray-800 border-gray-600"
                    onClick={() => copyGroupLink(`https://chat.whatsapp.com/${group.id}`, group.name)}
                  >
                    <Link className="w-4 h-4 mr-1" />
                    Copiar Link
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disparar Mensagem para Grupo */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Send className="w-5 h-5" />
            Disparar Mensagem para Grupo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Selecionar Grupo</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue placeholder="Escolha um grupo" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-300">Mensagem</Label>
            <Textarea
              value={groupMessage}
              onChange={(e) => setGroupMessage(e.target.value)}
              placeholder="Digite a mensagem para o grupo..."
              className="bg-gray-800 border-gray-600 text-gray-200"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSendMessage} className="btn-primary flex-1">
              <Send className="w-4 h-4 mr-2" />
              Enviar Mensagem
            </Button>
            <Button variant="outline" className="flex-1 bg-gray-800 border-gray-600">
              <Save className="w-4 h-4 mr-2" />
              Salvar Mensagem
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupManagement;
