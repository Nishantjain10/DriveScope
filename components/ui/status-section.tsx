"use client";

import Link from 'next/link';
import { Provider } from './provider-dock';
import type { Connection } from '@/lib/types/api';

interface StatusSectionProps {
  selectedProvider: Provider;
  providerStatuses: Record<Provider, "idle" | "loading" | "success" | "error">;
  connectionsLoading: boolean;
  connections: Connection[] | undefined;
  onSendPing: () => void;
}

export function StatusSection({ 
  selectedProvider, 
  providerStatuses, 
  connectionsLoading, 
  connections, 
  onSendPing 
}: StatusSectionProps) {
  // Get provider display info
  const getProviderInfo = (provider: Provider) => {
    switch (provider) {
      case 'google-drive':
        return {
          name: 'Google Drive',
          logoSrc: '/drive.svg',
          isSupported: true,
          apiProvider: 'gdrive',
        };
      case 'onedrive':
        return {
          name: 'OneDrive',
          logoSrc: '/ms-onedrive.svg',
          isSupported: false,
          apiProvider: 'onedrive',
        };
      case 'dropbox':
        return {
          name: 'Dropbox',
          logoSrc: '/dropbox-icon.svg',
          isSupported: false,
          apiProvider: 'dropbox',
        };
      default:
        return {
          name: 'Google Drive',
          logoSrc: '/drive.svg',
          isSupported: true,
          apiProvider: 'gdrive',
        };
    }
  };

  const isConnected = connections && connections.length > 0;

  return (
    <section className="mt-8 lg:mt-12 flex h-44 lg:h-52 flex-col items-center px-4">
      {(providerStatuses[selectedProvider] === "loading" || connectionsLoading) && selectedProvider === 'google-drive' ? (
        <div className="flex flex-row gap-4">
          <div role="status">
            <svg
              aria-hidden="true"
              className="h-5 w-5 animate-spin fill-zinc-600 text-gray-200 dark:text-gray-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
          <span>Waiting for {getProviderInfo(selectedProvider).name} connection...</span>
        </div>
      ) : providerStatuses[selectedProvider] === "success" && isConnected ? (
        <h1 className="font-[Poppins] text-2xl font-light text-[#2D2D31]">
          Congratulations!
        </h1>
      ) : selectedProvider === 'google-drive' ? (
        <h1 className="font-[Poppins] text-2xl font-light text-[#2D2D31]">
          Check connection
        </h1>
      ) : null}

      <p className="mt-2 mb-8">
        {providerStatuses[selectedProvider] === "success" && isConnected ? (
          <span>You connected your {getProviderInfo(selectedProvider).name} successfully.</span>
        ) : (providerStatuses[selectedProvider] === "error" || providerStatuses[selectedProvider] === "idle") && selectedProvider === 'google-drive' ? (
          <span>Send a ping to verify the {getProviderInfo(selectedProvider).name} connection</span>
        ) : null}
      </p>

      {providerStatuses[selectedProvider] === "success" && isConnected ? (
        selectedProvider === 'google-drive' ? (
          <Link href="/files">
            <button className="cursor-pointer rounded-md bg-primary px-4 py-2 flex items-center gap-2 hover:bg-primary/90 text-primary-foreground transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M12 22V12L2 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M22 7L12 12L2 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
              <span className="text-primary-foreground font-medium">Import from {getProviderInfo(selectedProvider).name}</span>
            </button>
          </Link>
        ) : (
          <button 
            disabled 
            className="cursor-not-allowed rounded-md bg-neutral-300 px-4 py-2 flex items-center gap-2 text-neutral-500 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-neutral-500">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M12 22V12L2 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M22 7L12 12L2 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <span className="font-medium">{getProviderInfo(selectedProvider).name} (Coming Soon)</span>
          </button>
        )
      ) : (
        // Show "Coming Soon" for unsupported providers, "Send a ping" only for Google Drive
        selectedProvider === 'google-drive' ? (
          <button
            onClick={onSendPing}
            className={`cursor-pointer rounded-md bg-primary px-2.5 py-1.5 hover:bg-primary/90 text-primary-foreground transition-colors ${
              providerStatuses[selectedProvider] === "loading" || connectionsLoading ? "hidden" : "visible"
            }`}
          >
            <span className="text-primary-foreground">Send a ping</span>
          </button>
        ) : (
          <button 
            disabled 
            className="cursor-not-allowed rounded-md bg-neutral-300 px-2.5 py-1.5 flex items-center gap-2 text-neutral-500 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-neutral-500">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M12 22V12L2 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M22 7L12 12L2 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <span className="font-medium">{getProviderInfo(selectedProvider).name} (Coming Soon)</span>
          </button>
        )
      )}
    </section>
  );
}
