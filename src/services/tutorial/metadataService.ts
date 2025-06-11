
import { TutorialData } from './types';
import { tutorialDataService } from './dataService';
import { tutorialSaveService } from './saveService';
import { tutorialUpdateService } from './updateService';
import { tutorialDeleteService } from './deleteService';

class TutorialMetadataService {
  async ensureTutorialsTable(): Promise<void> {
    return tutorialDataService.ensureTutorialsTable();
  }

  async getTutorials(): Promise<TutorialData[]> {
    return tutorialDataService.getTutorials();
  }

  async saveTutorial(tutorial: TutorialData): Promise<void> {
    return tutorialSaveService.saveTutorial(tutorial);
  }

  async updateTutorial(tutorial: TutorialData): Promise<void> {
    return tutorialUpdateService.updateTutorial(tutorial);
  }

  async deleteTutorial(tutorialId: string): Promise<void> {
    return tutorialDeleteService.deleteTutorial(tutorialId);
  }
}

export const tutorialMetadataService = new TutorialMetadataService();
