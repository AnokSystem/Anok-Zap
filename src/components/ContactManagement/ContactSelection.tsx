
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Users2, Users, Crown, UserCheck, Loader2 } from 'lucide-react';
import { ContactType, MemberType, Group } from './types';

interface ContactSelectionProps {
  instances: any[];
  groups: Group[];
  selectedInstance: string;
  setSelectedInstance: (value: string) => void;
  contactType: ContactType;
  setContactType: (value: ContactType) => void;
  selectedGroup: string;
  setSelectedGroup: (value: string) => void;
  memberType: MemberType;
  setMemberType: (value: MemberType) => void;
  isLoadingGroups?: boolean;
}

const ContactSelection: React.FC<ContactSelectionProps> = ({
  instances,
  groups,
  selectedInstance,
  setSelectedInstance,
  contactType,
  setContactType,
  selectedGroup,
  setSelectedGroup,
  memberType,
  setMemberType,
  isLoadingGroups = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Seleção de Instância */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-primary-contrast">Instância WhatsApp</label>
        <Select value={selectedInstance} onValueChange={setSelectedInstance}>
          <SelectTrigger className="select-form">
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
        <label className="text-sm font-medium text-primary-contrast">Tipo de Contatos</label>
        <RadioGroup value={contactType} onValueChange={setContactType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="personal" id="personal" className="checkbox-form" />
            <label htmlFor="personal" className="flex items-center space-x-2 cursor-pointer text-gray-300">
              <User className="w-4 h-4 text-purple-accent" />
              <span>Contatos Pessoais</span>
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="groups" id="groups" className="checkbox-form" />
            <label htmlFor="groups" className="flex items-center space-x-2 cursor-pointer text-gray-300">
              <Users2 className="w-4 h-4 text-purple-accent" />
              <span>Contatos de Grupos</span>
            </label>
          </div>
        </RadioGroup>
      </div>

      {/* Seleção de Grupo */}
      {contactType === 'groups' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary-contrast">Grupo WhatsApp</label>
          {isLoadingGroups ? (
            <div className="flex items-center justify-center p-3 border rounded-md bg-gray-800/50 border-gray-700">
              <Loader2 className="w-4 h-4 animate-spin mr-2 text-purple-accent" />
              <span className="text-sm text-gray-400">Buscando grupos...</span>
            </div>
          ) : (
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="select-form">
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
          )}
        </div>
      )}

      {/* Tipo de Membros */}
      {contactType === 'groups' && selectedGroup && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-primary-contrast">Tipo de Membros</label>
          <RadioGroup value={memberType} onValueChange={setMemberType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" className="checkbox-form" />
              <label htmlFor="all" className="flex items-center space-x-2 cursor-pointer text-gray-300">
                <Users className="w-4 h-4 text-purple-accent" />
                <span>Todos os Membros</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="admin" id="admin" className="checkbox-form" />
              <label htmlFor="admin" className="flex items-center space-x-2 cursor-pointer text-gray-300">
                <Crown className="w-4 h-4 text-purple-accent" />
                <span>Apenas Administradores</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="members" id="members" className="checkbox-form" />
              <label htmlFor="members" className="flex items-center space-x-2 cursor-pointer text-gray-300">
                <UserCheck className="w-4 h-4 text-purple-accent" />
                <span>Apenas Membros</span>
              </label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
};

export default ContactSelection;
