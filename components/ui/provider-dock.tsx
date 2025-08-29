"use client";

import { Dock, DockItemData } from './dock';
import { FolderOpen } from 'lucide-react';

// Provider icons (you can replace these with actual provider logos)
const GoogleDriveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 2.5L3.5 12.5H9.5L14.5 2.5H8.5Z" fill="#0F9D58"/>
    <path d="M14.5 2.5L19.5 12.5H13.5L8.5 2.5H14.5Z" fill="#F4B400"/>
    <path d="M3.5 12.5L8.5 22.5H20.5L15.5 12.5H3.5Z" fill="#4285F4"/>
  </svg>
);

const OneDriveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.5 8.5C17.8 5.5 15.2 3.5 12 3.5C9.5 3.5 7.3 5 6.5 7.2C4.2 7.7 2.5 9.7 2.5 12C2.5 14.8 4.7 17 7.5 17H18C20.2 17 22 15.2 22 13C22 10.8 20.2 9 18 9C18.2 8.8 18.3 8.7 18.5 8.5Z" fill="#0078D4"/>
  </svg>
);

const DropboxIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 2L12 6L16.5 2L21 6L16.5 10L12 6L7.5 10L3 6L7.5 2Z" fill="#0061FF"/>
    <path d="M7.5 14L12 18L16.5 14L21 18L16.5 22L12 18L7.5 22L3 18L7.5 14Z" fill="#0061FF"/>
  </svg>
);

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
      icon: <GoogleDriveIcon />,
      label: 'Google Drive',
      onClick: () => onProviderSelect('google-drive'),
      isActive: selectedProvider === 'google-drive',
      isDisabled: false,
    },
    {
      icon: <OneDriveIcon />,
      label: 'OneDrive',
      onClick: () => onProviderSelect('onedrive'),
      isActive: selectedProvider === 'onedrive',
      isDisabled: true, // Disabled since we only support Google Drive for now
    },
    {
      icon: <DropboxIcon />,
      label: 'Dropbox',
      onClick: () => onProviderSelect('dropbox'),
      isActive: selectedProvider === 'dropbox',
      isDisabled: true, // Disabled since we only support Google Drive for now
    },
    {
      icon: <FolderOpen className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />,
      label: 'Browse Files',
      onClick: onNavigateToFiles,
      isActive: false,
      isDisabled: false,
    },
  ];

  return (
    <div className="w-full flex justify-center">
      <Dock 
        items={dockItems}
        panelHeight={68}
        baseItemSize={56}
        magnification={76}
        distance={150}
        className="border-neutral-200 dark:border-neutral-700"
      />
    </div>
  );
}
