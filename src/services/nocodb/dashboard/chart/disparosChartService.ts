
import { BaseChartService } from './baseChartService';
import { NocodbConfig } from '../../types';
import { createDateRange, filterRecordsByDate } from './dateUtils';

export class DisparosChartService extends BaseChartService {
  private MASS_MESSAGING_TABLE_ID = 'myx4lsmm5i02xcd';

  constructor(config: NocodbConfig) {
    super(config);
  }

  async getDisparosChartData(baseId: string, days: number = 7): Promise<any[]> {
    try {
      const clientId = await this.getClientId();
      
      console.log('📈 Buscando dados da tabela de disparos em massa para gráfico...');
      console.log('🎯 Cliente ID:', clientId);
      console.log('🗓️ Últimos', days, 'dias');

      const allDisparos = await this.fetchTableData(baseId, this.MASS_MESSAGING_TABLE_ID);
      
      console.log(`📊 ${allDisparos.length} disparos encontrados na tabela`);
      
      if (allDisparos.length > 0) {
        console.log('📋 Campos disponíveis:', Object.keys(allDisparos[0]));
        console.log('📝 Primeiro registro:', allDisparos[0]);
      }

      const clientDisparos = this.filterDataByUser(allDisparos, clientId);
      
      console.log(`📊 ${clientDisparos.length} disparos filtrados para cliente ${clientId}`);

      return this.processDisparosData(clientDisparos, days);
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados do gráfico de disparos:', error);
      return this.createEmptyDisparosData(days);
    }
  }

  private processDisparosData(disparos: any[], days: number): any[] {
    const dateRange = createDateRange(days);
    const chartData = [];

    for (const { date, nextDate, displayDate } of dateRange) {
      const dayDisparos = filterRecordsByDate(
        disparos, 
        date, 
        nextDate, 
        ['CreatedAt', 'Criado em', 'created_at', 'Hora de Início']
      );
      
      console.log(`📅 ${displayDate}: ${dayDisparos.length} disparos encontrados`);
      
      const totalDisparos = dayDisparos.reduce((acc, d) => {
        const count = parseInt(d['Total de Destinatários'] || d.recipient_count || '0');
        return acc + count;
      }, 0);
      
      const totalSucesso = dayDisparos.reduce((acc, d) => {
        const reached = parseInt(d['Mensagens Enviadas'] || d.sent_count || '0');
        return acc + reached;
      }, 0);
      
      console.log(`📊 ${displayDate}: ${totalDisparos} disparos, ${totalSucesso} sucessos`);
      
      chartData.push({
        date: displayDate,
        disparos: totalDisparos,
        sucesso: totalSucesso
      });
    }

    console.log('📊 Dados finais do gráfico de disparos:', chartData);
    return chartData;
  }

  private createEmptyDisparosData(days: number): any[] {
    console.log('⚠️ Criando dados vazios para o gráfico de disparos');
    const dateRange = createDateRange(days);
    return dateRange.map(({ displayDate }) => ({
      date: displayDate,
      disparos: 0,
      sucesso: 0
    }));
  }
}
