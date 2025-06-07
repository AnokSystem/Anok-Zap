
export class MinioAuth {
  private async sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async hmacSha256(key: ArrayBuffer | string, message: string): Promise<ArrayBuffer> {
    let keyBuffer: ArrayBuffer;
    
    if (typeof key === 'string') {
      keyBuffer = new TextEncoder().encode(key);
    } else {
      keyBuffer = key;
    }
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const msgBuffer = new TextEncoder().encode(message);
    return await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
  }

  private async createSigningKey(secretKey: string, dateStamp: string, region: string, service: string): Promise<ArrayBuffer> {
    const kDate = await this.hmacSha256('AWS4' + secretKey, dateStamp);
    const kRegion = await this.hmacSha256(kDate, region);
    const kService = await this.hmacSha256(kRegion, service);
    const kSigning = await this.hmacSha256(kService, 'aws4_request');
    return kSigning;
  }

  async createSignature(
    method: string, 
    path: string, 
    query: string, 
    headers: Record<string, string>, 
    payloadHash: string,
    accessKey: string,
    secretKey: string,
    region: string
  ): Promise<string> {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);

    // Canonical request
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key].trim()}`)
      .join('\n') + '\n';

    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');

    // Usar o hash do payload fornecido ou calcular para string vazia
    const finalPayloadHash = payloadHash || await this.sha256('');
    
    const canonicalRequest = [
      method,
      path,
      query,
      canonicalHeaders,
      signedHeaders,
      finalPayloadHash
    ].join('\n');

    console.log('Canonical request:', canonicalRequest);

    // String to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const canonicalRequestHash = await this.sha256(canonicalRequest);
    
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      canonicalRequestHash
    ].join('\n');

    console.log('String to sign:', stringToSign);

    // Calculate signature
    const signingKey = await this.createSigningKey(secretKey, dateStamp, region, 's3');
    const signature = await this.hmacSha256(signingKey, stringToSign);
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const authHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;
    console.log('Authorization header gerado:', authHeader);
    
    return authHeader;
  }
}
