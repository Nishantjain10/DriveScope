"use client";

import Link from 'next/link';
import { Provider } from './provider-dock';
import type { Connection } from '@/lib/types/api';
import { LoadingSpinner } from './icons/loading-spinner';
import { PackageIcon } from './icons/package-icon';

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
            <LoadingSpinner className="h-5 w-5 fill-zinc-600 text-gray-200 dark:text-gray-600" />
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
              <PackageIcon className="text-primary-foreground" />
              <span className="text-primary-foreground font-medium">Import from {getProviderInfo(selectedProvider).name}</span>
            </button>
          </Link>
        ) : (
          <button 
            disabled 
            className="cursor-not-allowed rounded-md bg-neutral-300 px-4 py-2 flex items-center gap-2 text-neutral-500 transition-colors"
          >
            <PackageIcon className="text-neutral-500" />
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
            <PackageIcon className="text-neutral-500" />
            <span className="font-medium">{getProviderInfo(selectedProvider).name} (Coming Soon)</span>
          </button>
        )
      )}
    </section>
  );
}
