
import { TutorialData } from './types';

class TutorialLocalStorageService {
  private readonly STORAGE_KEY = 'tutorials_data';

  getTutorials(): TutorialData[] {
    try {
      console.log('🔍 Buscando TODOS os tutoriais do localStorage (sem filtro de usuário)...');
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const tutorials = JSON.parse(data);
        console.log('✅ Tutoriais carregados do localStorage (TODOS os usuários):', tutorials.length, 'itens');
        return tutorials;
      }
      console.log('📋 Nenhum tutorial encontrado no localStorage');
      return [];
    } catch (error) {
      console.error('Erro ao buscar tutoriais do localStorage:', error);
      return [];
    }
  }

  saveTutorial(tutorial: TutorialData): void {
    try {
      console.log('💾 Salvando tutorial no localStorage:', tutorial.id);
      const tutorials = this.getTutorials();
      const existingIndex = tutorials.findIndex(t => t.id === tutorial.id);
      
      if (existingIndex >= 0) {
        tutorials[existingIndex] = tutorial;
        console.log('📝 Tutorial atualizado no localStorage');
      } else {
        tutorials.push(tutorial);
        console.log('➕ Novo tutorial adicionado ao localStorage');
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tutorials));
      console.log('✅ Tutorial salvo no localStorage com sucesso');
    } catch (error) {
      console.error('Erro ao salvar tutorial no localStorage:', error);
    }
  }

  deleteTutorial(tutorialId: string): void {
    try {
      console.log('🗑️ Deletando tutorial do localStorage:', tutorialId);
      const tutorials = this.getTutorials();
      const filtered = tutorials.filter(t => t.id !== tutorialId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      console.log('✅ Tutorial deletado do localStorage');
    } catch (error) {
      console.error('Erro ao deletar tutorial do localStorage:', error);
    }
  }

  clearAll(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🧹 Todos os tutoriais removidos do localStorage');
    } catch (error) {
      console.error('Erro ao limpar tutoriais do localStorage:', error);
    }
  }
}

export const tutorialLocalStorageService = new TutorialLocalStorageService();
