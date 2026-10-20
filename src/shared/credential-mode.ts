export type ProviderMode = 'mock' | 'live';

export interface CredentialStatus {
  openai: ProviderMode;
}

export function isRealOpenAIKey(key?: string): boolean {
  return !!key && key.startsWith('sk-') && !key.startsWith('sk-dummy') && key.length >= 20;
}

export function detectCredentialStatus(): CredentialStatus {
  return {
    openai: isRealOpenAIKey(process.env.OPENAI_API_KEY) ? 'live' : 'mock',
  };
}

export const credentialStatus = detectCredentialStatus();
