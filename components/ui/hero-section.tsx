"use client";

import Image from 'next/image';
import { Provider } from './provider-dock';

interface HeroSectionProps {
  selectedProvider: Provider;
  providerStatuses: Record<Provider, "idle" | "loading" | "success" | "error">;
}

export function HeroSection({ selectedProvider, providerStatuses }: HeroSectionProps) {
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

  return (
    <div className="mt-16 lg:mt-25 flex w-full max-w-[40em] items-center justify-center px-4">
      {/* Stack AI Logo */}
      <div className="rounded-[25%] border border-[#19191C0A] bg-[#F9F9FA] p-3 shadow-[0px_9.36px_9.36px_0px_hsla(0,0%,0%,0.04)]">
        <div className="rounded-[25%] border border-[#FAFAFB] bg-white p-5 shadow-[0px_2px_12px_0px_hsla(0,0%,0%,0.03)] lg:p-9">
          <Image
            alt="Stack AI logo"
            src="/stackai.svg"
            width={56}
            height={56}
          />
        </div>
      </div>
      
      {/* Connection Line with Animation */}
      <div
        className={`flex w-38 items-center transition-opacity duration-2500 ${
          providerStatuses[selectedProvider] === "success" ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="h-[1px] flex-1 bg-gradient-to-l from-zinc-400 to-zinc-400/15 connection-line-animate origin-left"></div>
        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-400/30 bg-zinc-400/10 text-zinc-600">
          <div className="w-2 h-2 bg-zinc-600 rounded-full connection-pulse"></div>
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-400 to-zinc-400/15 connection-line-animate origin-right"></div>
      </div>
      
      {/* Provider Logo */}
      <div className="rounded-[25%] border border-[#19191C0A] bg-[#F9F9FA] p-3 shadow-[0px_9.36px_9.36px_0px_hsla(0,0%,0%,0.04)]">
        <div className="rounded-[25%] border border-[#FAFAFB] bg-white p-5 shadow-[0px_2px_12px_0px_hsla(0,0%,0%,0.03)] lg:p-9">
          <Image
            alt={`${getProviderInfo(selectedProvider).name} logo`}
            src={getProviderInfo(selectedProvider).logoSrc}
            width={56}
            height={56}
          />
        </div>
      </div>
    </div>
  );
}
