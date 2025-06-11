
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, RefreshCw, UserMinus, UserPlus, Crown, UserX, Trash2 } from 'lucide-react';
import { Participant, Group } from '../types';

interface ParticipantsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGroup: Group | null;
  participants: Participant[];
  isLoadingParticipants: boolean;
  isLoading: boolean;
  onRefreshParticipants: () => void;
  onManageParticipant: (participantId: string, action: 'add' | 'remove' | 'promote' | 'demote') => void;
  onRemoveAllParticipants: (groupId: string, participants: Participant[], groupName: string) => void;
}

export const ParticipantsModal = ({
  isOpen,
  onOpenChange,
  selectedGroup,
  participants,
  isLoadingParticipants,
  isLoading,
  onRefreshParticipants,
  onManageParticipant,
  onRemoveAllParticipants
}: ParticipantsModalProps) => {
  if (!selectedGroup) return null;

  const regularParticipants = participants.filter(p => !p.isAdmin && !p.isSuperAdmin);
  const adminParticipants = participants.filter(p => p.isAdmin || p.isSuperAdmin);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary-contrast flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participantes do Grupo: {selectedGroup.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header com ações */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                {participants.length} participantes
              </Badge>
              <Badge variant="outline" className="text-sm">
                {adminParticipants.length} admins
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRefreshParticipants}
                disabled={isLoadingParticipants}
                className="bg-gray-700 border-gray-600"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingParticipants ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              {regularParticipants.length > 0 && (
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemoveAllParticipants(selectedGroup.id, participants, selectedGroup.name)}
                  disabled={isLoading}
                  className="bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover Todos
                </Button>
              )}
            </div>
          </div>

          {isLoadingParticipants ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-accent" />
                <p className="text-gray-400">Carregando participantes...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Administradores */}
              {adminParticipants.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    Administradores ({adminParticipants.length})
                  </h3>
                  <div className="space-y-2">
                    {adminParticipants.map((participant) => (
                      <div key={participant.id} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-200">{participant.name}</span>
                              <Badge 
                                variant={participant.isSuperAdmin ? "default" : "secondary"}
                                className={participant.isSuperAdmin ? "bg-yellow-600/20 text-yellow-400" : "bg-blue-600/20 text-blue-400"}
                              >
                                {participant.isSuperAdmin ? 'Super Admin' : 'Admin'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">{participant.phoneNumber}</p>
                          </div>
                          <div className="flex gap-2">
                            {!participant.isSuperAdmin && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => onManageParticipant(participant.id, 'demote')}
                                disabled={isLoading}
                                className="bg-gray-800 border-gray-600"
                              >
                                <UserMinus className="w-4 h-4 mr-1" />
                                Rebaixar
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => onManageParticipant(participant.id, 'remove')}
                              disabled={isLoading || participant.isSuperAdmin}
                              className="bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Remover
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adminParticipants.length > 0 && regularParticipants.length > 0 && (
                <Separator className="bg-gray-600" />
              )}

              {/* Participantes Regulares */}
              {regularParticipants.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Membros ({regularParticipants.length})
                  </h3>
                  <div className="space-y-2">
                    {regularParticipants.map((participant) => (
                      <div key={participant.id} className="p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="font-medium text-gray-200">{participant.name}</span>
                            <p className="text-sm text-gray-400">{participant.phoneNumber}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onManageParticipant(participant.id, 'promote')}
                              disabled={isLoading}
                              className="bg-gray-800 border-gray-600"
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              Promover
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => onManageParticipant(participant.id, 'remove')}
                              disabled={isLoading}
                              className="bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Remover
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {participants.length === 0 && (
                <div className="text-center p-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhum participante encontrado</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
