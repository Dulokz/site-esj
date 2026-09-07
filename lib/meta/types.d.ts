export type ConnectionStatus = 'not_connected' | 'pending' | 'connected' | 'error' | 'reauthorization_required';
export interface Tenant { id:string; name:string; slug:string; createdAt:string; updatedAt:string }
export interface User { id:string; tenantId:string; email:string; role:'admin'|'member'; createdAt:string; updatedAt:string }
export interface SessionContext { tenantId:string; userId:string; sessionId:string; role:'admin'; email:string; tenantName:string }
export interface WhatsAppConnection {
  id:string; tenantId:string; metaBusinessId:string; wabaId:string; phoneNumberId:string;
  displayPhoneNumber:string; status:ConnectionStatus; credentialReference:string|null;
  connectedAt:string|null; validatedAt:string|null; createdAt:string; updatedAt:string;
}
export interface SignupAttempt {
  id:string; tenantId:string; userId:string; sessionId:string; stateHash:string;
  expiresAt:string; consumedAt:string|null; createdAt:string;
}
export interface SignupResult {
  state:string; code?:string; error?:string; business_id?:string;
  waba_id?:string; phone_number_id?:string; signup_mode?:'standard'|'coexistence';
}
export interface CredentialStore {
  storeCredential(input:{tenantId:string; provider:'meta_whatsapp'; secret:{token:string; registrationPin:string; coexistence:boolean}}):Promise<string>;
  get(tenantId:string,id:string):Promise<{token:string; registrationPin:string; coexistence:boolean}>;
  delete(tenantId:string,id:string):Promise<void>;
}
