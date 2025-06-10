
export interface TutorialData {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  documentUrls: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTutorialData {
  title: string;
  description: string;
  category: string;
  videoFile?: File;
  documentFiles: File[];
}

export interface UploadResult {
  videoUrl?: string;
  documentUrls: string[];
}
