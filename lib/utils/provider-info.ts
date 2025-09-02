import { Provider } from '@/components/ui/provider-dock';

export interface ProviderInfo {
  name: string;
  logoSrc: string;
  isSupported: boolean;
  apiProvider: string;
}

export const PROVIDER_INFO: Record<Provider, ProviderInfo> = {
  'google-drive': {
    name: 'Google Drive',
    logoSrc: '/drive.svg',
    isSupported: true,
    apiProvider: 'gdrive',
  },
  'onedrive': {
    name: 'OneDrive',
    logoSrc: '/ms-onedrive.svg',
    isSupported: false,
    apiProvider: 'onedrive',
  },
  'dropbox': {
    name: 'Dropbox',
    logoSrc: '/dropbox-icon.svg',
    isSupported: false,
    apiProvider: 'dropbox',
  },
};

export function getProviderInfo(provider: Provider): ProviderInfo {
  return PROVIDER_INFO[provider];
}

export function getProviderName(provider: Provider): string {
  return PROVIDER_INFO[provider].name;
}

export function getProviderAPIName(provider: Provider): string {
  return PROVIDER_INFO[provider].apiProvider;
}

export function isProviderSupported(provider: Provider): boolean {
  return PROVIDER_INFO[provider].isSupported;
}
