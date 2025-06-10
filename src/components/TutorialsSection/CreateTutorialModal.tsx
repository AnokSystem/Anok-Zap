
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Video, FileText, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTutorials } from '@/hooks/useTutorials';
import { CreateTutorialData } from '@/services/tutorialService';

interface CreateTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTutorialModal = ({ isOpen, onClose }: CreateTutorialModalProps) => {
  const { createTutorial, uploading, testConnection } = useTutorials();
  const [formData, setFormData] = useState<CreateTutorialData>({
    title: '',
    description: '',
    category: '',
    documentFiles: []
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [connectionTested, setConnectionTested] = useState<boolean | null>(null);

  const categories = [
    'Primeiros Passos',
    'Guias Avançados',
    'Suporte',
    'Recursos Extras'
  ];

  const handleTestConnection = async () => {
    const result = await testConnection();
    setConnectionTested(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      return;
    }

    const tutorialData: CreateTutorialData = {
      ...formData,
      videoFile: videoFile || undefined
    };

    const success = await createTutorial(tutorialData);
    
    if (success) {
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        documentFiles: []
      });
      setVideoFile(null);
      setConnectionTested(null);
      onClose();
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho do arquivo (100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert('O vídeo deve ter no máximo 100MB');
        return;
      }
      setVideoFile(file);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validar cada arquivo (10MB por documento)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`O documento ${file.name} deve ter no máximo 10MB`);
        return false;
      }
      return true;
    });
    
    setFormData(prev => ({
      ...prev,
      documentFiles: [...prev.documentFiles, ...validFiles]
    }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documentFiles: prev.documentFiles.filter((_, i) => i !== index)
    }));
  };

  const removeVideo = () => {
    setVideoFile(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary-contrast">Criar Novo Tutorial</DialogTitle>
        </DialogHeader>

        {/* Teste de Conexão */}
        <div className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {connectionTested === null && (
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              )}
              {connectionTested === true && (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
              {connectionTested === false && (
                <X className="w-5 h-5 text-red-400" />
              )}
              <span className="text-gray-300">
                {connectionTested === null && 'Teste a conexão antes de continuar'}
                {connectionTested === true && 'Conexão com servidor OK'}
                {connectionTested === false && 'Erro na conexão com servidor'}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              className="border-gray-600"
            >
              Testar Conexão
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-gray-300">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-gray-200"
                placeholder="Digite o título do tutorial"
                required
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-gray-300">Categoria</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-200">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-300">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-gray-200 min-h-[100px]"
                placeholder="Descreva o conteúdo do tutorial"
                required
              />
            </div>
          </div>

          {/* Upload de Vídeo */}
          <div className="space-y-4">
            <Label className="text-gray-300">Vídeo (Opcional) - Máximo 100MB</Label>
            
            {videoFile ? (
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Video className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-gray-200 font-medium">{videoFile.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(videoFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeVideo}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 mb-2">Clique para selecionar um vídeo</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                  id="video-upload"
                />
                <Label htmlFor="video-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" className="border-gray-600">
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar Vídeo
                  </Button>
                </Label>
              </div>
            )}
          </div>

          {/* Upload de Documentos */}
          <div className="space-y-4">
            <Label className="text-gray-300">Documentos (Opcional) - Máximo 10MB cada</Label>
            
            {formData.documentFiles.length > 0 && (
              <div className="space-y-2">
                {formData.documentFiles.map((file, index) => (
                  <div key={index} className="bg-gray-800/50 p-3 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-gray-200 text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 mb-2">Adicione documentos complementares</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                multiple
                onChange={handleDocumentChange}
                className="hidden"
                id="document-upload"
              />
              <Label htmlFor="document-upload" className="cursor-pointer">
                <Button type="button" variant="outline" className="border-gray-600">
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Documentos
                </Button>
              </Label>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={uploading}
              className="border-gray-600"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={uploading || !formData.title || !formData.description || !formData.category || connectionTested !== true}
              className="btn-primary"
            >
              {uploading ? 'Criando...' : 'Criar Tutorial'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTutorialModal;
