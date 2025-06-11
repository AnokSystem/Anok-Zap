
import { TutorialData, CreateTutorialData } from './types';
import { tutorialMetadataService } from './metadataService';
import { tutorialFileUploadService } from './fileUploadService';

class TutorialService {
  async getTutorials(): Promise<TutorialData[]> {
    return tutorialMetadataService.getTutorials();
  }

  async createTutorial(data: CreateTutorialData): Promise<TutorialData> {
    // Generate tutorial ID
    const tutorialId = `tutorial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Upload files
    const uploadResult = await tutorialFileUploadService.uploadTutorialFiles(
      tutorialId,
      data.videoFile,
      data.documentFiles,
      data.coverImageFile
    );

    // Create tutorial data
    const tutorial: TutorialData = {
      id: tutorialId,
      title: data.title,
      description: data.description,
      category: data.category,
      videoUrl: uploadResult.videoUrl,
      documentUrls: uploadResult.documentUrls,
      coverImageUrl: uploadResult.coverImageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save tutorial metadata
    await tutorialMetadataService.saveTutorial(tutorial);
    
    return tutorial;
  }

  async updateTutorial(tutorial: TutorialData): Promise<void> {
    return tutorialMetadataService.updateTutorial(tutorial);
  }

  async deleteTutorial(tutorialId: string): Promise<void> {
    return tutorialMetadataService.deleteTutorial(tutorialId);
  }
}

export const tutorialService = new TutorialService();
