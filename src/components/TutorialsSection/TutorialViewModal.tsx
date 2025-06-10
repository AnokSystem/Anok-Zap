
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, FileText, Download, Calendar } from 'lucide-react';
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
      <DialogContent className="sm:max-w-[800px] bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
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
          {/* Vídeo */}
          {tutorial.videoUrl && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-gray-200">Vídeo Tutorial</h3>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Video className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-gray-400">
                      Player de vídeo será implementado aqui
                    </p>
                    <Button
                      onClick={() => window.open(tutorial.videoUrl, '_blank')}
                      className="btn-primary"
                    >
                      Abrir Vídeo
                    </Button>
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
