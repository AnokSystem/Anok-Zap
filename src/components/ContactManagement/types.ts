
export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  groupName?: string;
  isAdmin?: boolean;
}

export interface Group {
  id: string;
  name: string;
}

export type ContactType = 'personal' | 'groups';
export type MemberType = 'all' | 'admin' | 'members';
