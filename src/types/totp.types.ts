export interface AddSecretRequest {
    userId : number;
    secretKey: number;
    serviceName: string;  // Name of the service (e.g., "Google", "GitHub")
  }
  
  export interface TOTPResponse {
    success: boolean;
    data: {
      code?: string;
      validUntil?: Date;
    } | null;
    error?: string;
  }