
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from 'lucide-react';
import { TutorialData } from '@/services/tutorialService';
import VideoPlayerSection from './VideoPlayerSection';
import TutorialDescription from './TutorialDescription';
import DocumentsSection from './DocumentsSection';
import TutorialInfoSection from './TutorialInfoSection';

interface TutorialViewModalProps {
  tutorial: TutorialData | null;
  isOpen: boolean;
  onClose: () => void;
}

const TutorialViewModal = ({ tutorial, isOpen, onClose }: TutorialViewModalProps) => {
  if (!tutorial) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-primary-contrast text-xl">{tutorial.title}</DialogTitle>
              <div className="flex items-center space-x-4">
                <Badge className="bg-purple-accent/20 text-purple-accent border-purple-accent/30">
                  {tutorial.category}
                </Badge>
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>Criado em {formatDate(tutorial.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Player de Vídeo */}
          {tutorial.videoUrl && (
            <VideoPlayerSection videoUrl={tutorial.videoUrl} />
          )}

          {/* Descrição */}
          <TutorialDescription description={tutorial.description} />

          {/* Documentos */}
          <DocumentsSection documentUrls={tutorial.documentUrls} />

          {/* Informações do Tutorial */}
          <TutorialInfoSection tutorial={tutorial} />
        </div>

        <div className="flex justify-end pt-6">
          <Button onClick={onClose} className="btn-primary">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialViewModal;
