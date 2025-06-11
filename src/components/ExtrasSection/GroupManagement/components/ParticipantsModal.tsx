
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, RefreshCw, UserPlus, UserMinus, Crown, User, Loader2 } from 'lucide-react';
import { Group, Participant } from '../types';

interface ParticipantsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGroup: Group | null;
  participants: Participant[];
  isLoadingParticipants: boolean;
  isLoading: boolean;
  onRefreshParticipants: () => void;
  onManageParticipant: (participantId: string, action: 'add' | 'remove' | 'promote' | 'demote') => void;
}

export const ParticipantsModal = ({
  isOpen,
  onOpenChange,
  selectedGroup,
  participants,
  isLoadingParticipants,
  isLoading,
  onRefreshParticipants,
  onManageParticipant
}: ParticipantsModalProps) => {
  const [newParticipantNumber, setNewParticipantNumber] = useState('');

  const handleAddParticipant = async () => {
    if (!newParticipantNumber || !selectedGroup) return;

    console.log('➕ Adicionando novo participante:', newParticipantNumber);
    
    const formattedNumber = newParticipantNumber.includes('@') 
      ? newParticipantNumber 
      : newParticipantNumber + '@s.whatsapp.net';
    
    await onManageParticipant(formattedNumber, 'add');
    
    if (!isLoading) {
      setNewParticipantNumber('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary-contrast flex items-center justify-between">
            <span>Participantes: {selectedGroup?.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {participants.length} membros
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefreshParticipants}
                disabled={isLoadingParticipants}
                className="text-gray-400 hover:text-gray-200"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingParticipants ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Adicionar Participante</Label>
            <div className="flex gap-2">
              <Input
                value={newParticipantNumber}
                onChange={(e) => setNewParticipantNumber(e.target.value)}
                placeholder="Número do telefone (ex: 5511999999999)"
                className="bg-gray-700 border-gray-600"
                disabled={isLoading}
              />
              <Button 
                onClick={handleAddParticipant} 
                disabled={isLoading || !newParticipantNumber}
                className="bg-purple-accent hover:bg-purple-accent/80"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoadingParticipants ? (
              <div className="flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-accent" />
                  <p className="text-gray-400 text-sm">Carregando participantes...</p>
                </div>
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center p-8">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Nenhum participante encontrado</p>
              </div>
            ) : (
              participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded border border-gray-600">
                  <div>
                    <p className="text-gray-200 font-medium">{participant.name}</p>
                    <p className="text-gray-400 text-sm">{participant.phoneNumber}</p>
                    {participant.isAdmin && (
                      <span className="inline-flex items-center gap-1 text-yellow-400 text-xs bg-yellow-400/10 px-2 py-0.5 rounded mt-1">
                        <Crown className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                    {participant.isSuperAdmin && (
                      <span className="inline-flex items-center gap-1 text-purple-400 text-xs bg-purple-400/10 px-2 py-0.5 rounded mt-1">
                        <Crown className="w-3 h-3" />
                        Super Admin
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {!participant.isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-gray-800 border-gray-600 hover:bg-gray-700"
                        onClick={() => onManageParticipant(participant.id, 'promote')}
                        disabled={isLoading}
                        title="Promover a admin"
                      >
                        <Crown className="w-3 h-3" />
                      </Button>
                    )}
                    {participant.isAdmin && !participant.isSuperAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-gray-800 border-gray-600 hover:bg-gray-700"
                        onClick={() => onManageParticipant(participant.id, 'demote')}
                        disabled={isLoading}
                        title="Rebaixar para membro"
                      >
                        <User className="w-3 h-3" />
                      </Button>
                    )}
                    {!participant.isSuperAdmin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onManageParticipant(participant.id, 'remove')}
                        disabled={isLoading}
                        title="Remover do grupo"
                        className="hover:bg-red-600"
                      >
                        <UserMinus className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
