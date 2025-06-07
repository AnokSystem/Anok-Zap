import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Download, MessageSquare, Upload, User, Users2, Crown, UserCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { evolutionApiService } from '@/services/evolutionApi';
import { nocodbService } from '@/services/nocodb';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  groupName?: string;
  isAdmin?: boolean;
}

interface Group {
  id: string;
  name: string;
}

const ContactManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [instances, setInstances] = useState<any[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [contactType, setContactType] = useState<'personal' | 'groups'>('personal');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [memberType, setMemberType] = useState<'all' | 'admin' | 'members'>('all');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInstances();
  }, []);

  useEffect(() => {
    if (selectedInstance && contactType === 'groups') {
      loadGroups();
    }
  }, [selectedInstance, contactType]);

  const loadInstances = async () => {
    try {
      console.log('Carregando instâncias...');
      const instancesData = await evolutionApiService.getInstances();
      console.log('Instâncias carregadas:', instancesData);
      setInstances(instancesData);
      
      if (instancesData.length > 0) {
        toast({
          title: "Sucesso",
          description: `${instancesData.length} instâncias encontradas`,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar instâncias da Evolution API",
        variant: "destructive",
      });
    }
  };

  const loadGroups = async () => {
    if (!selectedInstance) return;
    
    try {
      console.log('Carregando grupos para instância:', selectedInstance);
      const groupsData = await evolutionApiService.getGroups(selectedInstance);
      console.log('Grupos carregados:', groupsData);
      setGroups(groupsData);
      
      toast({
        title: "Sucesso",
        description: `${groupsData.length} grupos encontrados`,
      });
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
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

    if (contactType === 'groups' && !selectedGroup) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um grupo",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let contactsData: Contact[] = [];

      if (contactType === 'personal') {
        console.log('Buscando contatos pessoais...');
        contactsData = await evolutionApiService.getAllContacts(selectedInstance);
      } else if (contactType === 'groups' && selectedGroup) {
        console.log('Buscando contatos do grupo:', selectedGroup);
        const groupContacts = await evolutionApiService.getGroupContacts(selectedInstance, selectedGroup);
        
        // Filtrar por tipo de membro se especificado
        if (memberType === 'admin') {
          contactsData = groupContacts.filter(contact => contact.isAdmin);
        } else if (memberType === 'members') {
          contactsData = groupContacts.filter(contact => !contact.isAdmin);
        } else {
          contactsData = groupContacts;
        }
      }

      console.log('Contatos encontrados:', contactsData);
      setContacts(contactsData);
      
      // Salvar no NocoDB
      if (contactsData.length > 0) {
        await nocodbService.saveContacts(contactsData, selectedInstance);
      }
      
      toast({
        title: "Sucesso",
        description: `${contactsData.length} contatos carregados com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      toast({
        title: "Erro",
        description: "Falha ao buscar contatos da Evolution API",
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

    const csvHeaders = contactType === 'groups' 
      ? "Nome,Telefone,Grupo,Tipo"
      : "Nome,Telefone";

    const csvContent = [
      csvHeaders,
      ...contacts.map(contact => {
        if (contactType === 'groups') {
          const memberTypeText = contact.isAdmin ? 'Admin' : 'Membro';
          return `"${contact.name}","${contact.phoneNumber}","${contact.groupName || ''}","${memberTypeText}"`;
        }
        return `"${contact.name}","${contact.phoneNumber}"`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contatos_${contactType}_${selectedInstance}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Sucesso",
      description: "Contatos exportados com sucesso",
    });
  };

  const startMassMessaging = () => {
    if (contacts.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum contato selecionado",
        variant: "destructive",
      });
      return;
    }

    // Preparar os contatos formatados
    const formattedContacts = contacts.map(contact => {
      if (contact.name && contact.name !== contact.phoneNumber) {
        return `${contact.phoneNumber} - ${contact.name}`;
      }
      return contact.phoneNumber;
    });

    // Salvar os contatos no localStorage para serem recuperados na página de disparo
    localStorage.setItem('massMessagingContacts', formattedContacts.join('\n'));
    localStorage.setItem('massMessagingInstance', selectedInstance);

    // Navegar para a página de disparo em massa (tab específica)
    navigate('/?tab=mass-messaging');
    
    toast({
      title: "Redirecionando",
      description: `${contacts.length} contatos exportados para disparo em massa`,
    });
  };

  const getSelectedInstanceName = () => {
    const instance = instances.find(inst => inst.id === selectedInstance);
    return instance ? instance.name : '';
  };

  const getSelectedGroupName = () => {
    const group = groups.find(grp => grp.id === selectedGroup);
    return group ? group.name : '';
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
            Recupere e gerencie contatos do WhatsApp das suas instâncias Evolution API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Instância */}
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

          {/* Tipo de Contatos */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Tipo de Contatos</label>
            <RadioGroup value={contactType} onValueChange={(value: 'personal' | 'groups') => setContactType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="personal" />
                <label htmlFor="personal" className="flex items-center space-x-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  <span>Contatos Pessoais</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="groups" id="groups" />
                <label htmlFor="groups" className="flex items-center space-x-2 cursor-pointer">
                  <Users2 className="w-4 h-4" />
                  <span>Contatos de Grupos</span>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Seleção de Grupo (apenas se tipo for 'groups') */}
          {contactType === 'groups' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Grupo WhatsApp</label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um grupo" />
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
          )}

          {/* Tipo de Membros (apenas se tipo for 'groups') */}
          {contactType === 'groups' && selectedGroup && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Tipo de Membros</label>
              <RadioGroup value={memberType} onValueChange={(value: 'all' | 'admin' | 'members') => setMemberType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <label htmlFor="all" className="flex items-center space-x-2 cursor-pointer">
                    <Users className="w-4 h-4" />
                    <span>Todos os Membros</span>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <label htmlFor="admin" className="flex items-center space-x-2 cursor-pointer">
                    <Crown className="w-4 h-4" />
                    <span>Apenas Administradores</span>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="members" id="members" />
                  <label htmlFor="members" className="flex items-center space-x-2 cursor-pointer">
                    <UserCheck className="w-4 h-4" />
                    <span>Apenas Membros</span>
                  </label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={fetchContacts}
              disabled={isLoading || !selectedInstance || (contactType === 'groups' && !selectedGroup)}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isLoading ? 'Buscando...' : 'Buscar Contatos'}
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
              Usar para Disparo
            </Button>
          </div>

          {/* Informações da Seleção */}
          {selectedInstance && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="text-sm space-y-1">
                  <p><strong>Instância:</strong> {getSelectedInstanceName()}</p>
                  <p><strong>Tipo:</strong> {contactType === 'personal' ? 'Contatos Pessoais' : 'Contatos de Grupos'}</p>
                  {contactType === 'groups' && selectedGroup && (
                    <>
                      <p><strong>Grupo:</strong> {getSelectedGroupName()}</p>
                      <p><strong>Membros:</strong> {
                        memberType === 'all' ? 'Todos' :
                        memberType === 'admin' ? 'Apenas Administradores' :
                        'Apenas Membros'
                      }</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabela de Contatos */}
          {contacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Contatos Encontrados ({contacts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Telefone</TableHead>
                        {contactType === 'groups' && <TableHead>Grupo</TableHead>}
                        {contactType === 'groups' && <TableHead>Tipo</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>{contact.phoneNumber}</TableCell>
                          {contactType === 'groups' && (
                            <TableCell>{contact.groupName || 'N/A'}</TableCell>
                          )}
                          {contactType === 'groups' && (
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                {contact.isAdmin ? (
                                  <>
                                    <Crown className="w-4 h-4 text-yellow-500" />
                                    <span>Admin</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 text-blue-500" />
                                    <span>Membro</span>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          )}
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
