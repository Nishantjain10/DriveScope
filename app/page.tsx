"use client";

import "./app.css";
import { useState } from "react";
import { useConnections } from "@/hooks/use-files";
import { ProviderDock, Provider } from "@/components/ui/provider-dock";
import { HeroSection } from "@/components/ui/hero-section";
import { StatusSection } from "@/components/ui/status-section";
import { ConnectionLogs } from "@/components/ui/connection-logs";
import { useRouter } from "next/navigation";

interface LogEntry {
  date: Date;
  method: string;
  path: string;
  status: number;
  response: string;
}

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider>('google-drive');
  
  // Separate connection states for each provider
  const [providerStatuses, setProviderStatuses] = useState<Record<Provider, "idle" | "loading" | "success" | "error">>({
    'google-drive': 'idle',
    'onedrive': 'idle',
    'dropbox': 'idle'
  });

  const router = useRouter();

  const { 
    data: connections, 
    isLoading: connectionsLoading, 
    refetch: refetchConnections 
  } = useConnections(selectedProvider);



  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    // Reset the status when switching providers to show fresh state
    setProviderStatuses(prev => ({ ...prev, [provider]: 'idle' }));
  };

  const handleNavigateToFiles = () => {
    router.push('/files');
  };



  async function sendPing() {
    const currentStatus = providerStatuses[selectedProvider];
    if (currentStatus === "loading") return;
    
    setProviderStatuses(prev => ({ ...prev, [selectedProvider]: "loading" }));
    
    try {
      // Trigger connection check
      await refetchConnections();
      
      // Get provider info for logging
      const providerNames = {
        'google-drive': 'Google Drive',
        'onedrive': 'OneDrive',
        'dropbox': 'Dropbox'
      };
      const providerAPIs = {
        'google-drive': 'gdrive',
        'onedrive': 'onedrive',
        'dropbox': 'dropbox'
      };
      
      const log = {
        date: new Date(),
        method: "GET",
        path: `/connections?connection_provider=${providerAPIs[selectedProvider]}&limit=10`,
        status: connections && connections.length > 0 ? 200 : 404,
        response: connections && connections.length > 0 
          ? `Found ${connections.length} connection(s) for ${providerNames[selectedProvider]}` 
          : `No connections found for ${providerNames[selectedProvider]}`,
      };
      setLogs((prevLogs) => [log, ...prevLogs]);
      
      const newStatus = connections && connections.length > 0 ? "success" : "error";
      setProviderStatuses(prev => ({ ...prev, [selectedProvider]: newStatus }));
    } catch (err) {
      const providerNames = {
        'google-drive': 'Google Drive',
        'onedrive': 'OneDrive',
        'dropbox': 'Dropbox'
      };
      const providerAPIs = {
        'google-drive': 'gdrive',
        'onedrive': 'onedrive',
        'dropbox': 'dropbox'
      };
      
      const log = {
        date: new Date(),
        method: "GET",
        path: `/connections?connection_provider=${providerAPIs[selectedProvider]}&limit=10`,
        status: 500,
        response: `Connection failed for ${providerNames[selectedProvider]}: ${err instanceof Error ? err.message : "Unknown error"}`,
      };
      setLogs((prevLogs) => [log, ...prevLogs]);
      setProviderStatuses(prev => ({ ...prev, [selectedProvider]: "error" }));
    }
    setShowLogs(true);
  }

  return (
    <main
      className="checker-background flex flex-col items-center p-5 relative"
    >
      <HeroSection 
        selectedProvider={selectedProvider}
        providerStatuses={providerStatuses}
      />

              <StatusSection
          selectedProvider={selectedProvider}
          providerStatuses={providerStatuses}
          connectionsLoading={connectionsLoading}
          connections={connections}
          onSendPing={sendPing}
        />

      {/* Provider Dock */}
      <div className="mt-6 lg:mt-8 mb-8 px-4">
        <ProviderDock
          selectedProvider={selectedProvider}
          onProviderSelect={handleProviderSelect}
          onNavigateToFiles={handleNavigateToFiles}
        />
      </div>



      <ConnectionLogs
        logs={logs}
        showLogs={showLogs}
        connections={connections}
        onToggle={() => setShowLogs(!showLogs)}
      />
    </main>
  );
}