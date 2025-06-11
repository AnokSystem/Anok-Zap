
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Settings, Link, Search, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const GroupManagement = () => {
  const { toast } = useToast();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groupMessage, setGroupMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    isPrivate: false
  });

  // Mock data for groups
  const groups = [
    { id: 'group1', name: 'Grupo de Vendas', members: 45, link: 'https://chat.whatsapp.com/abc123' },
    { id: 'group2', name: 'Suporte Técnico', members: 28, link: 'https://chat.whatsapp.com/def456' },
    { id: 'group3', name: 'Marketing Digital', members: 67, link: 'https://chat.whatsapp.com/ghi789' }
  ];

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = () => {
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
              <input
                type="checkbox"
                id="private"
                checked={newGroupData.isPrivate}
                onChange={(e) => setNewGroupData({ ...newGroupData, isPrivate: e.target.checked })}
                className="rounded"
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

          <Button onClick={handleCreateGroup} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Criar Grupo
          </Button>
        </CardContent>
      </Card>

      {/* Gerenciar Grupos Existentes */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Grupos
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
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-200">{group.name}</h4>
                  <span className="text-sm text-gray-400">{group.members} membros</span>
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
                    onClick={() => copyGroupLink(group.link, group.name)}
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

      {/* Enviar Mensagem para Grupo */}
      <Card className="border-gray-600/50 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-primary-contrast flex items-center gap-2">
            <Users className="w-5 h-5" />
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
                    {group.name} ({group.members} membros)
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

          <Button onClick={handleSendMessage} className="btn-primary w-full">
            Enviar Mensagem
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupManagement;
