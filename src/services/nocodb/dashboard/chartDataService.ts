
import { BaseNocodbService } from '../baseService';
import { NocodbConfig } from '../types';
import { userContextService } from '@/services/userContextService';

export class ChartDataService extends BaseNocodbService {
  constructor(config: NocodbConfig) {
    super(config);
  }

  // ID fixo da tabela de disparos em massa
  private MASS_MESSAGING_TABLE_ID = 'myx4lsmm5i02xcd';
  // CORREÇÃO: ID da tabela de notificações por plataforma
  private NOTIFICACOES_PLATAFORMAS_TABLE_ID = 'mzup2t8ygoiy5ub';

  private async getClientId(): Promise<string> {
    // CORREÇÃO: Usar o userContextService para obter dados consistentes
    const userId = userContextService.getUserId();
    const clientId = userContextService.getClientId();
    
    console.log('🔍 GRÁFICO - Dados do usuário:', { userId, clientId });
    
    // Retornar o clientId se disponível, senão o userId
    return clientId || userId || 'default';
  }

  async getDisparosChartData(baseId: string, days: number = 7): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      
      console.log('📈 Buscando dados da tabela de disparos em massa para gráfico...');
      console.log('🎯 Cliente ID:', clientId);
      console.log('🗓️ Últimos', days, 'dias');

      // Buscar dados da tabela de disparos em massa com ID fixo
      const timestamp = Date.now();
      const dataResponse = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.MASS_MESSAGING_TABLE_ID}?limit=1000&sort=-CreatedAt&_t=${timestamp}`,
        {
          headers: {
            ...this.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        }
      );

      if (!dataResponse.ok) {
        console.error('❌ Erro ao buscar dados da tabela de disparos:', dataResponse.status);
        return this.createEmptyChartData(days);
      }

      const data = await dataResponse.json();
      const allDisparos = data.list || [];
      
      console.log(`📊 ${allDisparos.length} disparos encontrados na tabela`);
      
      if (allDisparos.length > 0) {
        console.log('📋 Campos disponíveis:', Object.keys(allDisparos[0]));
        console.log('📝 Primeiro registro:', allDisparos[0]);
      }

      // CORREÇÃO: Filtrar por client_id usando a mesma lógica das outras partes do sistema
      const userId = userContextService.getUserId();
      const userClientId = userContextService.getClientId();
      
      const clientDisparos = allDisparos.filter(d => {
        const recordClientId = d['Cliente ID'] || d.client_id;
        
        // Verificar se pertence ao usuário atual usando userId ou clientId
        const belongsToUser = recordClientId === userId || 
                             recordClientId === userClientId ||
                             recordClientId === clientId;
                             
        console.log('🔍 GRÁFICO - Filtrando disparo:', {
          recordClientId,
          userId,
          userClientId,
          clientId,
          belongsToUser
        });
        
        return belongsToUser;
      });
      
      console.log(`📊 ${clientDisparos.length} disparos filtrados para cliente ${clientId} (userId: ${userId})`);

      // Gerar dados para os últimos dias
      const chartData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dateStr = date.toISOString().split('T')[0];
        
        // Filtrar disparos do dia
        const dayDisparos = clientDisparos.filter(d => {
          const createdAt = d.CreatedAt || d['Criado em'] || d.created_at || d['Hora de Início'];
          if (!createdAt) return false;
          
          const recordDate = new Date(createdAt);
          return recordDate >= date && recordDate < nextDate;
        });
        
        console.log(`📅 ${dateStr}: ${dayDisparos.length} disparos encontrados`);
        
        // Calcular totais do dia
        const totalDisparos = dayDisparos.reduce((acc, d) => {
          const count = parseInt(d['Total de Destinatários'] || d.recipient_count || '0');
          return acc + count;
        }, 0);
        
        const totalSucesso = dayDisparos.reduce((acc, d) => {
          // Usar dados reais da tabela - contatos alcançados ou mensagens enviadas
          const reached = parseInt(d['Mensagens Enviadas'] || d.sent_count || '0');
          return acc + reached;
        }, 0);
        
        console.log(`📊 ${dateStr}: ${totalDisparos} disparos, ${totalSucesso} sucessos`);
        
        chartData.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          disparos: totalDisparos,
          sucesso: totalSucesso
        });
      }

      console.log('📊 Dados finais do gráfico de disparos:', chartData);
      return chartData;
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados do gráfico de disparos:', error);
      return this.createEmptyChartData(days);
    }
  }

  private createEmptyChartData(days: number): any[] {
    console.log('⚠️ Criando dados vazios para o gráfico');
    const emptyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      emptyData.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        disparos: 0,
        sucesso: 0
      });
    }
    return emptyData;
  }

  async getNotificationsChartData(baseId: string, days: number = 7): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      console.log('📊 GRÁFICO NOTIF - Buscando dados para cliente:', clientId);
      
      // CORREÇÃO: Usar dados do userContextService para filtragem consistente
      const userId = userContextService.getUserId();
      const userClientId = userContextService.getClientId();
      
      console.log('🔍 GRÁFICO NOTIF - Dados do usuário:', { userId, userClientId, clientId });
      console.log('🎯 GRÁFICO NOTIF - Usando tabela ID:', this.NOTIFICACOES_PLATAFORMAS_TABLE_ID);
      console.log('🌐 GRÁFICO NOTIF - Base ID:', baseId);
      console.log('📡 GRÁFICO NOTIF - URL completa:', `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.NOTIFICACOES_PLATAFORMAS_TABLE_ID}`);
      
      // Adicionar timestamp para evitar cache
      const timestamp = Date.now();
      const url = `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.NOTIFICACOES_PLATAFORMAS_TABLE_ID}?limit=10000&sort=-Id&_t=${timestamp}`;
      
      console.log('📡 GRÁFICO NOTIF - Fazendo requisição para:', url);
      
      const response = await fetch(url, {
        headers: {
          ...this.headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });

      console.log('📡 GRÁFICO NOTIF - Status da resposta:', response.status);
      console.log('📡 GRÁFICO NOTIF - Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GRÁFICO NOTIF - Erro na resposta:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 GRÁFICO NOTIF - Resposta completa:', data);
      
      const allNotifications = data.list || [];
      
      console.log(`📊 ${allNotifications.length} notificações totais encontradas`);
      
      if (allNotifications.length > 0) {
        console.log('📋 GRÁFICO NOTIF - Campos disponíveis:', Object.keys(allNotifications[0]));
        console.log('📝 GRÁFICO NOTIF - Primeiro registro completo:', allNotifications[0]);
        console.log('📝 GRÁFICO NOTIF - Segundo registro (se existir):', allNotifications[1]);
        console.log('📝 GRÁFICO NOTIF - Terceiro registro (se existir):', allNotifications[2]);
      }
      
      // CORREÇÃO: Filtro mais robusto usando diferentes campos de identificação
      const clientNotifications = allNotifications.filter(n => {
        // Verificar diferentes campos que podem conter o ID do cliente
        const recordClientId = n.client_id || n['client_id'] || n['Cliente ID'] || n.ClientId;
        const recordUserId = n.user_id || n['user_id'] || n['ID do Usuário'] || n.UserId;
        
        // Verificar se pertence ao usuário atual
        const belongsToUser = recordClientId === userId || 
                             recordClientId === userClientId ||
                             recordUserId === userId ||
                             recordUserId === userClientId;
        
        console.log('🔍 GRÁFICO NOTIF - Análise do registro:', { 
          recordId: n.Id || n.id,
          recordClientId, 
          recordUserId,
          userId, 
          userClientId, 
          belongsToUser,
          allFields: Object.keys(n)
        });
        
        return belongsToUser;
      });
      
      console.log(`📊 ${clientNotifications.length} notificações filtradas para cliente ${clientId} (userId: ${userId})`);
      
      // Se não há dados filtrados, mostrar dados de exemplo para debug
      if (clientNotifications.length === 0) {
        console.log('⚠️ GRÁFICO NOTIF - Nenhuma notificação filtrada, criando dados vazios');
        const emptyData = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          emptyData.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            hotmart: 0,
            eduzz: 0,
            monetizze: 0
          });
        }
        return emptyData;
      }
      
      const chartData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayNotifications = clientNotifications.filter(n => {
          const eventDate = n.event_date || n.CreatedAt || n.created_at || n.createdAt || n['Data do Evento'];
          return eventDate && eventDate.startsWith(dateStr);
        });
        
        console.log(`📅 GRÁFICO NOTIF - ${dateStr}: ${dayNotifications.length} notificações encontradas`);
        
        // Contar notificações por plataforma
        const hotmart = dayNotifications.filter(n => {
          const platform = (n.platform || n.Platform || n.Plataforma || '').toLowerCase();
          return platform.includes('hotmart');
        }).length;
        
        const eduzz = dayNotifications.filter(n => {
          const platform = (n.platform || n.Platform || n.Plataforma || '').toLowerCase();
          return platform.includes('eduzz');
        }).length;
        
        const monetizze = dayNotifications.filter(n => {
          const platform = (n.platform || n.Platform || n.Plataforma || '').toLowerCase();
          return platform.includes('monetizze');
        }).length;
        
        const outras = dayNotifications.length - (hotmart + eduzz + monetizze);
        
        console.log(`📊 GRÁFICO NOTIF - ${dateStr}: hotmart=${hotmart}, eduzz=${eduzz}, monetizze=${monetizze}, outras=${outras}`);
        
        chartData.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          hotmart: hotmart,
          eduzz: eduzz,
          monetizze: monetizze + outras // Somar outras na monetizze para não perder dados
        });
      }

      console.log('📊 GRÁFICO NOTIF - Dados finais calculados:', chartData);
      return chartData;
      
    } catch (error) {
      console.error('❌ GRÁFICO NOTIF - Erro crítico:', error);
      console.error('❌ GRÁFICO NOTIF - Stack trace:', error.stack);
      
      // Retornar dados vazios em caso de erro
      const emptyData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        emptyData.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          hotmart: 0,
          eduzz: 0,
          monetizze: 0
        });
      }
      return emptyData;
    }
  }

  private createEmptyChartData(days: number): any[] {
    console.log('⚠️ Criando dados vazios para o gráfico');
    const emptyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      emptyData.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        disparos: 0,
        sucesso: 0
      });
    }
    return emptyData;
  }

  async getDisparosChartData(baseId: string, days: number = 7): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      
      console.log('📈 Buscando dados da tabela de disparos em massa para gráfico...');
      console.log('🎯 Cliente ID:', clientId);
      console.log('🗓️ Últimos', days, 'dias');

      // Buscar dados da tabela de disparos em massa com ID fixo
      const timestamp = Date.now();
      const dataResponse = await fetch(
        `${this.config.baseUrl}/api/v1/db/data/noco/${baseId}/${this.MASS_MESSAGING_TABLE_ID}?limit=1000&sort=-CreatedAt&_t=${timestamp}`,
        {
          headers: {
            ...this.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        }
      );

      if (!dataResponse.ok) {
        console.error('❌ Erro ao buscar dados da tabela de disparos:', dataResponse.status);
        return this.createEmptyChartData(days);
      }

      const data = await dataResponse.json();
      const allDisparos = data.list || [];
      
      console.log(`📊 ${allDisparos.length} disparos encontrados na tabela`);
      
      if (allDisparos.length > 0) {
        console.log('📋 Campos disponíveis:', Object.keys(allDisparos[0]));
        console.log('📝 Primeiro registro:', allDisparos[0]);
      }

      // CORREÇÃO: Filtrar por client_id usando a mesma lógica das outras partes do sistema
      const userId = userContextService.getUserId();
      const userClientId = userContextService.getClientId();
      
      const clientDisparos = allDisparos.filter(d => {
        const recordClientId = d['Cliente ID'] || d.client_id;
        
        // Verificar se pertence ao usuário atual usando userId ou clientId
        const belongsToUser = recordClientId === userId || 
                             recordClientId === userClientId ||
                             recordClientId === clientId;
                             
        console.log('🔍 GRÁFICO - Filtrando disparo:', {
          recordClientId,
          userId,
          userClientId,
          clientId,
          belongsToUser
        });
        
        return belongsToUser;
      });
      
      console.log(`📊 ${clientDisparos.length} disparos filtrados para cliente ${clientId} (userId: ${userId})`);

      // Gerar dados para os últimos dias
      const chartData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dateStr = date.toISOString().split('T')[0];
        
        // Filtrar disparos do dia
        const dayDisparos = clientDisparos.filter(d => {
          const createdAt = d.CreatedAt || d['Criado em'] || d.created_at || d['Hora de Início'];
          if (!createdAt) return false;
          
          const recordDate = new Date(createdAt);
          return recordDate >= date && recordDate < nextDate;
        });
        
        console.log(`📅 ${dateStr}: ${dayDisparos.length} disparos encontrados`);
        
        // Calcular totais do dia
        const totalDisparos = dayDisparos.reduce((acc, d) => {
          const count = parseInt(d['Total de Destinatários'] || d.recipient_count || '0');
          return acc + count;
        }, 0);
        
        const totalSucesso = dayDisparos.reduce((acc, d) => {
          // Usar dados reais da tabela - contatos alcançados ou mensagens enviadas
          const reached = parseInt(d['Mensagens Enviadas'] || d.sent_count || '0');
          return acc + reached;
        }, 0);
        
        console.log(`📊 ${dateStr}: ${totalDisparos} disparos, ${totalSucesso} sucessos`);
        
        chartData.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          disparos: totalDisparos,
          sucesso: totalSucesso
        });
      }

      console.log('📊 Dados finais do gráfico de disparos:', chartData);
      return chartData;
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados do gráfico de disparos:', error);
      return this.createEmptyChartData(days);
    }
  }
}
