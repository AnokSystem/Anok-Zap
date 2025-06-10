
export interface ContactData {
  name: string;
  phoneNumber: string;
}

export class VariableProcessor {
  static processMessage(message: string, contact: ContactData): string {
    const now = new Date();
    
    // Extrair primeiro nome
    const firstName = contact.name.split(' ')[0] || contact.name;
    
    // Obter dia da semana em português
    const daysOfWeek = [
      'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
      'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];
    
    const variables: { [key: string]: string } = {
      '{nome}': contact.name,
      '{telefone}': contact.phoneNumber,
      '{primeiroNome}': firstName,
      '{dataAtual}': now.toLocaleDateString('pt-BR'),
      '{horaAtual}': now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      '{diaSemana}': daysOfWeek[now.getDay()]
    };
    
    let processedMessage = message;
    
    // Substituir todas as variáveis
    Object.entries(variables).forEach(([variable, value]) => {
      processedMessage = processedMessage.replace(new RegExp(variable, 'g'), value);
    });
    
    return processedMessage;
  }
  
  static getAvailableVariables(): string[] {
    return ['{nome}', '{telefone}', '{primeiroNome}', '{dataAtual}', '{horaAtual}', '{diaSemana}'];
  }
  
  static validateMessage(message: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const availableVars = this.getAvailableVariables();
    
    // Encontrar todas as variáveis na mensagem
    const variableRegex = /\{[^}]+\}/g;
    const foundVariables = message.match(variableRegex) || [];
    
    // Verificar se há variáveis inválidas
    foundVariables.forEach(variable => {
      if (!availableVars.includes(variable)) {
        errors.push(`Variável inválida: ${variable}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
