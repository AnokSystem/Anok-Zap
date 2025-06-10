
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTutorials } from '@/hooks/useTutorials';
import { CreateTutorialData } from '@/services/tutorialService';
import BasicInfoForm from './CreateTutorialModal/BasicInfoForm';
import CoverImageUploadSection from './CreateTutorialModal/CoverImageUploadSection';
import VideoUploadSection from './CreateTutorialModal/VideoUploadSection';
import DocumentUploadSection from './CreateTutorialModal/DocumentUploadSection';
import FormActions from './CreateTutorialModal/FormActions';

interface CreateTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTutorialModal = ({ isOpen, onClose }: CreateTutorialModalProps) => {
  const { createTutorial, uploading } = useTutorials();
  const [formData, setFormData] = useState<CreateTutorialData>({
    title: '',
    description: '',
    category: '',
    documentFiles: []
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      return;
    }

    const tutorialData: CreateTutorialData = {
      ...formData,
      videoFile: videoFile || undefined,
      coverImageFile: coverImageFile || undefined
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
      setCoverImageFile(null);
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isFormValid = formData.title && formData.description && formData.category;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary-contrast">Criar Novo Tutorial</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <BasicInfoForm
            title={formData.title}
            description={formData.description}
            category={formData.category}
            onTitleChange={(title) => setFormData(prev => ({ ...prev, title }))}
            onDescriptionChange={(description) => setFormData(prev => ({ ...prev, description }))}
            onCategoryChange={(category) => setFormData(prev => ({ ...prev, category }))}
          />

          <CoverImageUploadSection
            coverImageFile={coverImageFile}
            onCoverImageChange={setCoverImageFile}
            formatFileSize={formatFileSize}
          />

          <VideoUploadSection
            videoFile={videoFile}
            onVideoChange={setVideoFile}
            formatFileSize={formatFileSize}
          />

          <DocumentUploadSection
            documentFiles={formData.documentFiles}
            onDocumentFilesChange={(documentFiles) => setFormData(prev => ({ ...prev, documentFiles }))}
            formatFileSize={formatFileSize}
          />

          <FormActions
            onClose={onClose}
            uploading={uploading}
            isFormValid={!!isFormValid}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTutorialModal;
