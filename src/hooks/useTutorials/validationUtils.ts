
import { CreateTutorialData } from '@/services/tutorialService';

export const validateTutorialData = (data: CreateTutorialData): { isValid: boolean; error?: string } => {
  if (!data.title || !data.description || !data.category) {
    return {
      isValid: false,
      error: "Título, descrição e categoria são obrigatórios"
    };
  }

  if (data.videoFile && data.videoFile.size > 100 * 1024 * 1024) { // 100MB
    return {
      isValid: false,
      error: "O vídeo deve ter no máximo 100MB"
    };
  }

  for (const doc of data.documentFiles) {
    if (doc.size > 10 * 1024 * 1024) { // 10MB
      return {
        isValid: false,
        error: `O documento ${doc.name} deve ter no máximo 10MB`
      };
    }
  }

  return { isValid: true };
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('MinIO') || error.message.includes('upload')) {
      return "Erro no upload dos arquivos. Verifique sua conexão.";
    } else if (error.message.includes('salvo')) {
      return "Erro ao salvar os dados do tutorial";
    } else {
      return error.message;
    }
  }
  return "Erro desconhecido";
};
