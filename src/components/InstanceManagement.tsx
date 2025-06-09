
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import UserAuthWarning from './UserAuthWarning';
import InstanceHeader from './InstanceManagement/InstanceHeader';
import CreateInstanceForm from './InstanceManagement/CreateInstanceForm';
import InstanceGrid from './InstanceManagement/InstanceGrid';
import QrCodeModal from './InstanceManagement/QrCodeModal';
import DeleteInstanceDialog from './InstanceManagement/DeleteInstanceDialog';
import { useInstanceOperations } from './InstanceManagement/hooks/useInstanceOperations';

const InstanceManagement = () => {
  const { user } = useAuth();
  const [showQrModal, setShowQrModal] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState('');
  
  // Estados para confirmação de exclusão
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    instanceId: '',
    instanceName: '',
  });

  const {
    instances,
    isLoading,
    connectingInstance,
    loadInstances,
    createInstance,
    deleteInstance,
    toggleInstanceConnection,
    stopMonitoring,
  } = useInstanceOperations(user?.ID || null);

  const showDeleteConfirmation = (instanceId: string, instanceName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      instanceId,
      instanceName,
    });
  };

  const hideDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      instanceId: '',
      instanceName: '',
    });
  };

  const confirmDeleteInstance = async () => {
    if (!deleteConfirmation.instanceId) return;
    await deleteInstance(deleteConfirmation.instanceId, deleteConfirmation.instanceName);
    hideDeleteConfirmation();
  };

  const handleToggleConnection = async (instanceId: string, currentStatus: string) => {
    const qrCode = await toggleInstanceConnection(instanceId, currentStatus);
    if (qrCode) {
      setCurrentQrCode(qrCode);
      setShowQrModal(true);
    }
  };

  const closeQrModal = () => {
    setShowQrModal(false);
    setCurrentQrCode('');
    stopMonitoring();
  };

  if (!user) {
    return (
      <div className="space-y-8">
        <InstanceHeader />
        <UserAuthWarning />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <InstanceHeader userName={user.Nome} />
      
      <CreateInstanceForm 
        onCreateInstance={createInstance}
        isLoading={isLoading}
      />

      <InstanceGrid
        instances={instances}
        isLoading={isLoading}
        connectingInstance={connectingInstance}
        onRefresh={loadInstances}
        onDelete={showDeleteConfirmation}
        onToggleConnection={handleToggleConnection}
      />

      <QrCodeModal
        isOpen={showQrModal}
        onClose={closeQrModal}
        qrCode={currentQrCode}
      />

      <DeleteInstanceDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={hideDeleteConfirmation}
        onConfirm={confirmDeleteInstance}
        instanceName={deleteConfirmation.instanceName}
      />
    </div>
  );
};

export default InstanceManagement;
