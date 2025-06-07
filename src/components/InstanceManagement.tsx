
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Plus, Trash2, RefreshCcw, QrCode } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { evolutionApiService } from '@/services/evolutionApi';
import { nocodbService } from '@/services/nocodb';

interface Instance {
  id: string;
  name: string;
  status: string;
  creationDate: string;
}

const InstanceManagement = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newInstanceName, setNewInstanceName] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [selectedInstance, setSelectedInstance] = useState('');
  const [notificationPhone, setNotificationPhone] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    setIsLoading(true);
    try {
      const instancesData = await evolutionApiService.getInstances();
      setInstances(instancesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load instances",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createInstance = async () => {
    if (!newInstanceName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an instance name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newInstance = await evolutionApiService.createInstance(newInstanceName);
      
      // Save to NocoDB
      await nocodbService.saveInstance(newInstance);
      
      setInstances([...instances, newInstance]);
      setNewInstanceName('');
      setShowCreateDialog(false);
      
      toast({
        title: "Success",
        description: "Instance created successfully",
      });

      // Send notification if phone provided
      if (notificationPhone) {
        await evolutionApiService.sendMessage(
          newInstance.id,
          notificationPhone,
          `Instance ${newInstanceName} created successfully.`
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create instance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQrCode = async (instanceId: string) => {
    setIsLoading(true);
    try {
      const qrCodeData = await evolutionApiService.generateQrCode(instanceId);
      setQrCode(qrCodeData);
      setSelectedInstance(instanceId);
      setShowQrDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectInstance = async () => {
    if (!selectedInstance) return;
    
    setIsLoading(true);
    try {
      await evolutionApiService.connectInstance(selectedInstance);
      setShowQrDialog(false);
      await loadInstances(); // Refresh instances
      
      toast({
        title: "Success",
        description: "Instance connected successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect instance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInstance = async (instanceId: string, instanceName: string) => {
    if (!confirm(`Are you sure you want to delete instance "${instanceName}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await evolutionApiService.deleteInstance(instanceId);
      setInstances(instances.filter(instance => instance.id !== instanceId));
      
      toast({
        title: "Success",
        description: "Instance deleted successfully",
      });

      // Send notification if phone provided
      if (notificationPhone) {
        // Use a different instance to send the notification
        const availableInstance = instances.find(i => i.id !== instanceId && i.status === 'connected');
        if (availableInstance) {
          await evolutionApiService.sendMessage(
            availableInstance.id,
            notificationPhone,
            `Instance ${instanceName} deleted successfully.`
          );
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete instance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      case 'connecting':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Instance Management</span>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Instance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New WhatsApp Instance</DialogTitle>
                  <DialogDescription>
                    Create a new WhatsApp instance for messaging
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Instance Name</Label>
                    <Input
                      value={newInstanceName}
                      onChange={(e) => setNewInstanceName(e.target.value)}
                      placeholder="Enter instance name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notification Phone (optional)</Label>
                    <Input
                      value={notificationPhone}
                      onChange={(e) => setNotificationPhone(e.target.value)}
                      placeholder="+5511999999999"
                    />
                  </div>
                  <Button
                    onClick={createInstance}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Creating...' : 'Create Instance'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Manage your WhatsApp instances for messaging
          </CardDescription>
        </CardHeader>
        <CardContent>
          {instances.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No instances found. Create your first instance to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instance Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instances.map((instance) => (
                  <TableRow key={instance.id}>
                    <TableCell className="font-medium">{instance.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                        {instance.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(instance.creationDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateQrCode(instance.id)}
                          disabled={isLoading}
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteInstance(instance.id, instance.name)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect WhatsApp Instance</DialogTitle>
            <DialogDescription>
              Scan this QR code with your WhatsApp to connect the instance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {qrCode && (
              <div className="flex justify-center p-4 bg-white border rounded-lg">
                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
              </div>
            )}
            <div className="flex space-x-2">
              <Button
                onClick={() => generateQrCode(selectedInstance)}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh QR
              </Button>
              <Button
                onClick={connectInstance}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstanceManagement;
