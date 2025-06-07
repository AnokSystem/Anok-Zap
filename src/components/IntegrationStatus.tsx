import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { evolutionApiService } from '@/services/evolutionApi';
import { nocodbService } from '@/services/nocodb';
import { minioService } from '@/services/minio';

interface IntegrationStatus {
  name: string;
  status: 'conectado' | 'erro' | 'verificando';
  message: string;
  lastCheck: Date;
}

const IntegrationStatus = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    { name: 'Evolution API', status: 'verificando', message: 'Verificando...', lastCheck: new Date() },
    { name: 'NocoDB', status: 'verificando', message: 'Verificando...', lastCheck: new Date() },
    { name: 'Minio S3', status: 'verificando', message: 'Verificando...', lastCheck: new Date() },
  ]);

  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkIntegrations();
  }, []);

  const checkIntegrations = async () => {
    setIsChecking(true);
    console.log('Iniciando verificação das integrações...');
    
    const newIntegrations = [...integrations];

    // Verificar Evolution API
    try {
      console.log('Verificando Evolution API...');
      const instances = await evolutionApiService.getInstances();
      newIntegrations[0] = {
        name: 'Evolution API',
        status: 'conectado',
        message: `API funcionando - ${instances.length} instâncias encontradas`,
        lastCheck: new Date()
      };
      console.log('Evolution API: Conectado');
    } catch (error) {
      console.error('Evolution API: Erro', error);
      newIntegrations[0] = {
        name: 'Evolution API',
        status: 'erro',
        message: 'Erro de autenticação ou conexão',
        lastCheck: new Date()
      };
    }

    // Verificar NocoDB
    try {
      console.log('Verificando NocoDB...');
      const isConnected = await nocodbService.testConnection();
      newIntegrations[1] = {
        name: 'NocoDB',
        status: isConnected ? 'conectado' : 'erro',
        message: isConnected ? 'Banco de dados conectado e operacional' : 'Falha na conexão - verifique credenciais',
        lastCheck: new Date()
      };
      console.log('NocoDB:', isConnected ? 'Conectado' : 'Erro');
    } catch (error) {
      console.error('NocoDB: Erro', error);
      newIntegrations[1] = {
        name: 'NocoDB',
        status: 'erro',
        message: 'Falha na comunicação com o banco',
        lastCheck: new Date()
      };
    }

    // Verificar Minio
    try {
      console.log('Verificando Minio S3...');
      const isConnected = await minioService.testConnection();
      const files = await minioService.listFiles();
      
      newIntegrations[2] = {
        name: 'Minio S3',
        status: isConnected ? 'conectado' : 'erro',
        message: isConnected 
          ? `Sistema de arquivos operacional (${files.length} arquivos)` 
          : 'Erro na conexão com servidor de arquivos',
        lastCheck: new Date()
      };
      console.log('Minio:', isConnected ? 'Conectado' : 'Erro');
    } catch (error) {
      console.error('Minio: Erro', error);
      newIntegrations[2] = {
        name: 'Minio S3',
        status: 'erro',
        message: 'Erro no sistema de arquivos',
        lastCheck: new Date()
      };
    }

    setIntegrations(newIntegrations);
    setIsChecking(false);
    console.log('Verificação das integrações concluída');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'conectado':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'erro':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'conectado':
        return 'bg-green-100 text-green-800';
      case 'erro':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Status das Integrações</span>
          <Button
            onClick={checkIntegrations}
            disabled={isChecking}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Verificando...' : 'Atualizar'}
          </Button>
        </CardTitle>
        <CardDescription>
          Status das conexões com os serviços externos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {integrations.map((integration, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(integration.status)}
                <div>
                  <h4 className="font-medium">{integration.name}</h4>
                  <p className="text-sm text-gray-600">{integration.message}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(integration.status)}>
                  {integration.status}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">
                  {integration.lastCheck.toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationStatus;
