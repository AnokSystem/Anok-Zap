
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, FileText, Download, Calendar, Maximize } from 'lucide-react';
import { TutorialData } from '@/services/tutorialService';

interface TutorialViewModalProps {
  tutorial: TutorialData | null;
  isOpen: boolean;
  onClose: () => void;
}

const TutorialViewModal = ({ tutorial, isOpen, onClose }: TutorialViewModalProps) => {
  if (!tutorial) return null;

  const handleDownloadDocument = (docUrl: string, index: number) => {
    window.open(docUrl, '_blank');
  };

  const handleFullscreen = () => {
    const videoElement = document.getElementById('tutorial-video') as HTMLVideoElement;
    if (videoElement) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      } else if ((videoElement as any).webkitRequestFullscreen) {
        (videoElement as any).webkitRequestFullscreen();
      } else if ((videoElement as any).msRequestFullscreen) {
        (videoElement as any).msRequestFullscreen();
      }
    }
  };

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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Video className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-gray-200">Vídeo Tutorial</h3>
                </div>
                <Button
                  onClick={handleFullscreen}
                  variant="outline"
                  size="sm"
                  className="border-gray-600"
                >
                  <Maximize className="w-4 h-4 mr-2" />
                  Tela Cheia
                </Button>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-600">
                <div className="relative">
                  <video
                    id="tutorial-video"
                    className="w-full aspect-video rounded-lg bg-black"
                    controls
                    preload="metadata"
                    controlsList="nodownload"
                  >
                    <source src={tutorial.videoUrl} type="video/mp4" />
                    <source src={tutorial.videoUrl} type="video/webm" />
                    <source src={tutorial.videoUrl} type="video/ogg" />
                    Seu navegador não suporta a reprodução de vídeo.
                  </video>
                </div>
              </div>

              {/* Informações do Vídeo */}
              <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-600">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400">Formato:</span>
                    <span className="text-gray-200">MP4/WebM</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400">Controles disponíveis</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Descrição */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-200">Descrição</h3>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {tutorial.description}
              </p>
            </div>
          </div>

          {/* Documentos */}
          {tutorial.documentUrls.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-gray-200">Documentos Complementares</h3>
              </div>
              
              <div className="space-y-2">
                {tutorial.documentUrls.map((docUrl, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium">
                            Documento {index + 1}
                          </p>
                          <p className="text-xs text-gray-400">
                            Material complementar
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleDownloadDocument(docUrl, index)}
                        variant="outline"
                        size="sm"
                        className="border-gray-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações do Tutorial */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
            <h3 className="font-semibold text-gray-200 mb-3">Informações do Tutorial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Categoria:</span>
                <span className="text-gray-200 ml-2">{tutorial.category}</span>
              </div>
              <div>
                <span className="text-gray-400">Criado em:</span>
                <span className="text-gray-200 ml-2">{formatDate(tutorial.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-400">Atualizado em:</span>
                <span className="text-gray-200 ml-2">{formatDate(tutorial.updatedAt)}</span>
              </div>
              <div>
                <span className="text-gray-400">Recursos:</span>
                <span className="text-gray-200 ml-2">
                  {[
                    tutorial.videoUrl && 'Vídeo',
                    tutorial.documentUrls.length > 0 && `${tutorial.documentUrls.length} doc(s)`
                  ].filter(Boolean).join(', ') || 'Apenas texto'}
                </span>
              </div>
            </div>
          </div>
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
