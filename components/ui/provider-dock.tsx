"use client";

import { Dock, DockItemData } from './dock';
import { FolderOpen } from 'lucide-react';
import Image from 'next/image';

export type Provider = 'google-drive' | 'onedrive' | 'dropbox';

interface ProviderDockProps {
  selectedProvider: Provider;
  onProviderSelect: (provider: Provider) => void;
  onNavigateToFiles: () => void;
}

export function ProviderDock({ 
  selectedProvider, 
  onProviderSelect, 
  onNavigateToFiles 
}: ProviderDockProps) {

  const dockItems: DockItemData[] = [
    {
      icon: (
        <Image
          src="/drive.svg"
          alt="Google Drive"
          width={28}
          height={28}
          className="rounded-sm"
        />
      ),
      label: 'Google Drive',
      onClick: () => onProviderSelect('google-drive'),
      className: selectedProvider === 'google-drive' ? 'border-[#202124] border-2 shadow-[0px_2px_12px_0px_hsla(0,0%,0%,0.1)]' : '',
    },
    {
      icon: (
        <Image
          src="/ms-onedrive.svg"
          alt="OneDrive"
          width={28}
          height={28}
          className="rounded-sm"
        />
      ),
      label: 'OneDrive',
      onClick: () => onProviderSelect('onedrive'),
      className: selectedProvider === 'onedrive' ? 'border-[#202124] border-2 shadow-[0px_2px_12px_0px_hsla(0,0%,0%,0.1)]' : '',
    },
    {
      icon: (
        <Image
          src="/dropbox-icon.svg"
          alt="Dropbox"
          width={28}
          height={28}
          className="rounded-sm"
        />
      ),
      label: 'Dropbox',
      onClick: () => onProviderSelect('dropbox'),
      className: selectedProvider === 'dropbox' ? 'border-[#202124] border-2 shadow-[0px_2px_12px_0px_hsla(0,0%,0%,0.1)]' : '',
    },
    {
      icon: <FolderOpen className="w-7 h-7 text-neutral-600 dark:text-neutral-400" />,
      label: 'Browse Files',
      onClick: onNavigateToFiles,
    },
  ];

  return (
    <div className="w-full flex justify-center">
      <Dock 
        items={dockItems}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
        distance={150}
        spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
      />
    </div>
  );
}
