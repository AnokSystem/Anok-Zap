
export interface GroupData {
  name: string;
  description: string;
  isPrivate: boolean;
  participants: string;
  profileImage: File | null;
}

export interface EditGroupData {
  name: string;
  description: string;
  pictureFile: File | null;
  isAnnounce: boolean;
  isRestricted: boolean;
}

export interface Participant {
  id: string;
  name: string;
  phoneNumber: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  size: number;
  isAnnounce?: boolean;
  isRestricted?: boolean;
  inviteCode?: string;
}
