
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Image } from 'lucide-react';

interface CoverImageUploadSectionProps {
  coverImageFile: File | null;
  onCoverImageChange: (file: File | null) => void;
  formatFileSize: (bytes: number) => string;
}

const CoverImageUploadSection = ({ 
  coverImageFile, 
  onCoverImageChange, 
  formatFileSize 
}: CoverImageUploadSectionProps) => {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }
      
      onCoverImageChange(file);
    }
  };

  const handleRemoveFile = () => {
    onCoverImageChange(null);
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-primary-contrast flex items-center">
          <Image className="w-5 h-5 mr-2" />
          Imagem de Capa (Opcional)
        </CardTitle>
        <CardDescription className="text-gray-400">
          Adicione uma imagem de capa para o tutorial (máximo 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!coverImageFile ? (
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-400 mb-4">
              Arraste uma imagem aqui ou clique para selecionar
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="cover-image-upload"
            />
            <Button
              type="button"
              variant="outline"
              className="btn-secondary"
              onClick={() => document.getElementById('cover-image-upload')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Imagem
            </Button>
          </div>
        ) : (
          <div className="border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Image className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-primary-contrast font-medium">{coverImageFile.name}</p>
                  <p className="text-gray-400 text-sm">{formatFileSize(coverImageFile.size)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoverImageUploadSection;
