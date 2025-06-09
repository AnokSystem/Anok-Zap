
export class ErrorHandler {
  static createHttpError(status: number, errorText: string): Error {
    return new Error(`HTTP ${status}: ${errorText}`);
  }

  static handleApiError(error: any, operation: string, data?: any): boolean {
    console.error(`❌ Erro ${operation}:`, error);
    if (data) {
      console.error('❌ Dados que causaram erro:', JSON.stringify(data, null, 2));
    }
    console.error('❌ Stack trace:', error.stack);
    return false;
  }

  static logOperationStart(operation: string, data?: any) {
    console.log(`💾 ${operation}...`);
    if (data) {
      console.log('📋 Dados da operação:', data);
    }
  }

  static logOperationSuccess(operation: string) {
    console.log(`✅ ${operation} com sucesso`);
  }

  static logOperationFailure(operation: string) {
    console.error(`❌ Falha ao ${operation.toLowerCase()}`);
  }
}
