
import { nocodbService } from '@/services/nocodb';
import { Disparo } from './types';
import { transformDisparoData } from './dataTransformer';

export const fetchAllDisparos = async (): Promise<Disparo[]> => {
  try {
    console.log('📨 Buscando TODOS os disparos da tabela específica...');
    
    const data = await nocodbService.getAllDisparos();
    
    if (data && data.length > 0) {
      console.log('📋 Dados brutos recebidos do NocoDB (todos):', data);
      
      const transformedDisparos: Disparo[] = data.map(transformDisparoData);
      
      console.log('✅ Todos os disparos transformados:', transformedDisparos);
      return transformedDisparos;
    } else {
      console.log('⚠️ Nenhum disparo encontrado na tabela específica');
      return [];
    }
  } catch (error) {
    console.error('❌ Erro ao buscar disparos:', error);
    throw new Error('Erro ao carregar disparos');
  }
};
