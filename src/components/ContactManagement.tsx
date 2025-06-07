
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Download, MessageSquare, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { nocodbService } from '@/services/nocodb';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  groupName?: string;
}

const ContactManagement = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      const instancesData = await evolutionApiService.getInstances();
      setInstances(instancesData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar instâncias",
        variant: "destructive",
      });
    }
  };

  const loadGroups = async () => {
    try {
      const groupsData = await evolutionApiService.getGroups(selectedInstance);
      setGroups(groupsData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar grupos",
        variant: "destructive",
      });
    }
  };

  const fetchContacts = async () => {
    if (!selectedInstance) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma instância primeiro",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let contactsData;
      if (selectedGroup && selectedGroup !== 'all') {
        contactsData = await evolutionApiService.getGroupContacts(selectedInstance, selectedGroup);
      } else {
        contactsData = await evolutionApiService.getAllContacts(selectedInstance);
      }

      setContacts(contactsData);
      
      // Salvar no NocoDB
      await nocodbService.saveContacts(contactsData, selectedInstance);
      
      toast({
        title: "Sucesso",
        description: `${contactsData.length} contatos carregados`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao buscar contatos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportContacts = () => {
    if (contacts.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum contato para exportar",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      "Nome,Telefone,Grupo",
      ...contacts.map(contact => 
        `"${contact.name}","${contact.phoneNumber}","${contact.groupName || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contatos_whatsapp_${selectedInstance}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Sucesso",
      description: "Contatos exportados com sucesso",
    });
  };

  const startMassMessaging = () => {
    const phoneNumbers = contacts.map(contact => contact.phoneNumber).join('\n');
    navigator.clipboard.writeText(phoneNumbers);
    toast({
      title: "Sucesso",
      description: "Números copiados para área de transferência. Vá para Disparo em Massa para utilizá-los.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Gerenciamento de Contatos</span>
          </CardTitle>
          <CardDescription>
            Recupere e gerencie contatos do WhatsApp das suas instâncias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Instância e Grupo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Instância WhatsApp</label>
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma instância" />
                </SelectTrigger>
                <SelectContent>
                  {instances.map((instance) => (
                    <SelectItem key={instance.id} value={instance.id}>
                      {instance.name} ({instance.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Grupo WhatsApp (Opcional)</label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os contatos ou selecione um grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os contatos</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={fetchContacts}
              disabled={isLoading || !selectedInstance}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isLoading ? 'Carregando...' : 'Buscar Contatos'}
            </Button>

            <Button
              onClick={exportContacts}
              disabled={contacts.length === 0}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>

            <Button
              onClick={startMassMessaging}
              disabled={contacts.length === 0}
              variant="outline"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Disparo em Massa
            </Button>
          </div>

          {/* Tabela de Contatos */}
          {contacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Contatos ({contacts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Grupo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>{contact.phoneNumber}</TableCell>
                          <TableCell>{contact.groupName || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactManagement;
