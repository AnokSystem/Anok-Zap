
import { useState } from 'react';
import { ContactType, MemberType } from './types';
import { useInstances } from './hooks/useInstances';
import { useGroups } from './hooks/useGroups';
import { useContactFetch } from './hooks/useContactFetch';
import { useContactActions } from './hooks/useContactActions';

export const useContactManagement = () => {
  const [contactType, setContactType] = useState<ContactType>('personal');
  const [memberType, setMemberType] = useState<MemberType>('all');

  const {
    instances,
    selectedInstance,
    setSelectedInstance,
    getSelectedInstanceName,
  } = useInstances();

  const {
    groups,
    selectedGroup,
    setSelectedGroup,
    getSelectedGroupName,
    isLoadingGroups,
  } = useGroups({ selectedInstance, contactType });

  const {
    contacts,
    isLoading,
    fetchContacts,
  } = useContactFetch({ selectedInstance, contactType, selectedGroup, memberType });

  const {
    exportContacts,
    startMassMessaging,
  } = useContactActions({ contacts, contactType, selectedInstance });

  return {
    instances,
    groups,
    selectedInstance,
    setSelectedInstance,
    contactType,
    setContactType,
    selectedGroup,
    setSelectedGroup,
    memberType,
    setMemberType,
    contacts,
    isLoading,
    fetchContacts,
    exportContacts,
    startMassMessaging,
    getSelectedInstanceName,
    getSelectedGroupName,
    isLoadingGroups,
  };
};
