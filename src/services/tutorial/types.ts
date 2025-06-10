
export interface TutorialData {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  documentUrls: string[];
  category: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTutorialData {
  title: string;
  description: string;
  category: string;
  videoFile?: File;
  documentFiles: File[];
  coverImageFile?: File;
}

export interface UploadResult {
  videoUrl?: string;
  documentUrls: string[];
  coverImageUrl?: string;
}
