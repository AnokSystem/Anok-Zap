
import { TutorialData } from './types';

class TutorialLocalStorageService {
  private readonly STORAGE_KEY = 'tutoriais_metadata';

  getTutorials(): TutorialData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const tutorials = JSON.parse(stored);
        console.log('Tutoriais carregados do localStorage:', tutorials.length, 'itens');
        
        // Validar estrutura dos dados
        const validTutorials = tutorials.filter((tutorial: any) => 
          tutorial.id && tutorial.title && tutorial.description && tutorial.category
        );
        
        return validTutorials;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar tutoriais do localStorage:', error);
      return [];
    }
  }

  saveTutorial(tutorial: TutorialData): void {
    try {
      const existing = this.getTutorials();
      const filtered = existing.filter(t => t.id !== tutorial.id);
      const updated = [...filtered, tutorial];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      console.log('Tutorial salvo no localStorage');
    } catch (error) {
      console.error('Erro ao salvar tutorial no localStorage:', error);
    }
  }

  deleteTutorial(tutorialId: string): void {
    try {
      const existing = this.getTutorials();
      const updated = existing.filter(t => t.id !== tutorialId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      console.log('Tutorial removido do localStorage');
    } catch (error) {
      console.error('Erro ao deletar tutorial do localStorage:', error);
    }
  }

  clearAll(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Todos os tutoriais foram removidos do localStorage');
    } catch (error) {
      console.error('Erro ao limpar tutoriais:', error);
    }
  }
}

export const tutorialLocalStorageService = new TutorialLocalStorageService();
