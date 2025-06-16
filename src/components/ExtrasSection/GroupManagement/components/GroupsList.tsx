
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Search, Edit, Link, Loader2, LogOut } from 'lucide-react';
import { Group } from '../types';

interface GroupsListProps {
  selectedInstance: string;
  groups: Group[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isLoadingGroups: boolean;
  onEditGroup: (group: Group) => void;
  onOpenParticipants: (group: Group) => void;
  onCopyGroupLink: (groupId: string, groupName: string) => void;
  onDeleteGroup: (groupId: string, groupName: string) => void;
}

export const GroupsList = ({
  selectedInstance,
  groups,
  searchTerm,
  onSearchChange,
  isLoadingGroups,
  onEditGroup,
  onOpenParticipants,
  onCopyGroupLink,
  onDeleteGroup
}: GroupsListProps) => {
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedInstance) return null;

  return (
    <Card className="bg-white border-gray-200 data-[theme=light]:bg-white data-[theme=light]:border-gray-200 data-[theme=dark]:border-gray-600/50 data-[theme=dark]:bg-gray-800/30">
      <CardHeader>
        <CardTitle className="text-primary-contrast flex items-center gap-2">
          <Users className="w-5 h-5" />
          Grupos ({filteredGroups.length})
          {isLoadingGroups && (
            <div className="flex items-center gap-2 text-gray-400 data-[theme=light]:text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Buscando grupos...</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-gray-700 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-300">Buscar Grupos</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar grupos..."
              className="bg-white border-gray-300 pl-10 data-[theme=light]:bg-white data-[theme=light]:border-gray-300 data-[theme=dark]:bg-gray-800 data-[theme=dark]:border-gray-600"
            />
          </div>
        </div>

        {isLoadingGroups ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-accent" />
              <p className="text-gray-400 data-[theme=light]:text-gray-600">Buscando grupos...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGroups.map((group) => (
              <div key={group.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 data-[theme=light]:bg-gray-50 data-[theme=light]:border-gray-200 data-[theme=dark]:bg-gray-700/30 data-[theme=dark]:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-700 data-[theme=light]:text-gray-700 data-[theme=dark]:text-gray-200">{group.name}</h4>
                  <span className="text-sm text-gray-500 data-[theme=light]:text-gray-500 data-[theme=dark]:text-gray-400">
                    {group.size} membros
                  </span>
                </div>
                {group.description && (
                  <p className="text-gray-500 text-sm mb-3 data-[theme=light]:text-gray-500 data-[theme=dark]:text-gray-400">{group.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-white border-gray-300 data-[theme=light]:bg-white data-[theme=light]:border-gray-300 data-[theme=dark]:bg-gray-800 data-[theme=dark]:border-gray-600"
                    onClick={() => onEditGroup(group)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-white border-gray-300 data-[theme=light]:bg-white data-[theme=light]:border-gray-300 data-[theme=dark]:bg-gray-800 data-[theme=dark]:border-gray-600"
                    onClick={() => onOpenParticipants(group)}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Participantes
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-white border-gray-300 data-[theme=light]:bg-white data-[theme=light]:border-gray-300 data-[theme=dark]:bg-gray-800 data-[theme=dark]:border-gray-600"
                    onClick={() => onCopyGroupLink(group.id, group.name)}
                  >
                    <Link className="w-4 h-4 mr-1" />
                    Link Convite
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30"
                    onClick={() => onDeleteGroup(group.id, group.name)}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sair
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
