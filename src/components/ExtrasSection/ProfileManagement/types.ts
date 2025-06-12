
export interface Instance {
  id: string;
  name: string;
  status: string;
  creationDate: string;
  connectionStatus?: string;
  profileName?: string;
  profilePicUrl?: string;
}

export interface PrivacySettingsType {
  readreceipts: 'all' | 'none';
  profile: 'all' | 'contacts' | 'contact_blacklist' | 'none';
  status: 'all' | 'contacts' | 'contact_blacklist' | 'none';
  online: 'all' | 'match_last_seen';
  last: 'all' | 'contacts' | 'contact_blacklist' | 'none';
  groupadd: 'all' | 'contacts' | 'contact_blacklist';
}

export interface ProfileData {
  name: string;
  status: string;
  description: string;
  profilePhoto: File | null;
  profilePhotoUrl: string;
}
