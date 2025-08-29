"use client";

import "./app.css";
import { useState, useEffect, useRef, useCallback } from "react";
import { useConnections } from "@/hooks/use-files";
import { ProviderDock, Provider } from "@/components/ui/provider-dock";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface LogEntry {
  date: Date;
  method: string;
  path: string;
  status: number;
  response: string;
}

export default function Home() {
  const [detailHeight, setDetailHeight] = useState(55);
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

  const detailsRef = useRef<HTMLDetailsElement>(null);

  const { 
    data: connections, 
    isLoading: connectionsLoading, 
    refetch: refetchConnections 
  } = useConnections(selectedProvider);

  const updateHeight = useCallback(() => {
    if (detailsRef.current) {
      setDetailHeight(detailsRef.current.clientHeight);
    }
  }, []);

  useEffect(() => {
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [updateHeight]);

  useEffect(() => {
    const currentDetails = detailsRef.current;
    if (!currentDetails) return;
    
    currentDetails.addEventListener("toggle", updateHeight);

    return () => {
      if (currentDetails) {
        currentDetails.removeEventListener("toggle", updateHeight);
      }
    };
  }, [updateHeight]);

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    // Reset the status when switching providers to show fresh state
    setProviderStatuses(prev => ({ ...prev, [provider]: 'idle' }));
  };

  const handleNavigateToFiles = () => {
    router.push('/files');
  };

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

  async function sendPing() {
    const currentStatus = providerStatuses[selectedProvider];
    if (currentStatus === "loading") return;
    
    setProviderStatuses(prev => ({ ...prev, [selectedProvider]: "loading" }));
    
    try {
      // Trigger connection check
      await refetchConnections();
      const log = {
        date: new Date(),
        method: "GET",
        path: `/connections?connection_provider=${getProviderInfo(selectedProvider).apiProvider || 'gdrive'}&limit=10`,
        status: connections && connections.length > 0 ? 200 : 404,
        response: connections && connections.length > 0 
          ? `Found ${connections.length} connection(s) for ${getProviderInfo(selectedProvider).name}` 
          : `No connections found for ${getProviderInfo(selectedProvider).name}`,
      };
      setLogs((prevLogs) => [log, ...prevLogs]);
      
      const newStatus = connections && connections.length > 0 ? "success" : "error";
      setProviderStatuses(prev => ({ ...prev, [selectedProvider]: newStatus }));
    } catch (err) {
      const log = {
        date: new Date(),
        method: "GET",
        path: `/connections?connection_provider=${getProviderInfo(selectedProvider).apiProvider || 'gdrive'}&limit=10`,
        status: 500,
        response: `Connection failed for ${getProviderInfo(selectedProvider).name}: ${err instanceof Error ? err.message : "Unknown error"}`,
      };
      setLogs((prevLogs) => [log, ...prevLogs]);
      setProviderStatuses(prev => ({ ...prev, [selectedProvider]: "error" }));
    }
    setShowLogs(true);
  }

  const isConnected = connections && connections.length > 0;

  return (
    <main
      className="checker-background flex flex-col items-center p-5 relative"
      style={{ marginBottom: `${detailHeight}px` }}
    >
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

      <section className="mt-8 lg:mt-12 flex h-44 lg:h-52 flex-col items-center px-4">
        {providerStatuses[selectedProvider] === "loading" || connectionsLoading ? (
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
        ) : (
          <h1 className="font-[Poppins] text-2xl font-light text-[#2D2D31]">
            Check connection
          </h1>
        )}

        <p className="mt-2 mb-8">
          {providerStatuses[selectedProvider] === "success" && isConnected ? (
            <span>You connected your {getProviderInfo(selectedProvider).name} successfully.</span>
          ) : providerStatuses[selectedProvider] === "error" || providerStatuses[selectedProvider] === "idle" ? (
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
          <button
            onClick={sendPing}
            className={`cursor-pointer rounded-md bg-primary px-2.5 py-1.5 hover:bg-primary/90 text-primary-foreground transition-colors ${
              providerStatuses[selectedProvider] === "loading" || connectionsLoading ? "hidden" : "visible"
            }`}
          >
            <span className="text-primary-foreground">Send a ping</span>
          </button>
        )}
      </section>

      {/* Provider Dock */}
      <div className="mt-6 lg:mt-8 mb-8 px-4">
        <ProviderDock
          selectedProvider={selectedProvider}
          onProviderSelect={handleProviderSelect}
          onNavigateToFiles={handleNavigateToFiles}
        />
      </div>



      <aside className="fixed bottom-0 flex w-full cursor-pointer border-t border-[#EDEDF0] bg-white">
        <details open={showLogs} ref={detailsRef} className="w-full">
          <summary className="flex w-full flex-row justify-between p-4 marker:content-none">
            <div className="flex gap-2">
              <span className="font-semibold">Connection Logs</span>
              {logs.length > 0 && (
                <div className="flex items-center rounded-md bg-[#E6E6E6] px-2">
                  <span className="font-semibold">{logs.length}</span>
                </div>
              )}
            </div>
            <div className="icon">
              <span aria-hidden="true">⌄</span>
            </div>
          </summary>
          <div className="flex w-full flex-col lg:flex-row">
            <div className="flex flex-col border-r border-[#EDEDF0]">
              <div className="border-y border-[#EDEDF0] bg-[#FAFAFB] px-4 py-2 text-[#97979B]">
                Project
              </div>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div className="flex flex-col">
                  <span className="text-[#97979B]">Stack AI URL</span>
                  <span className="truncate text-xs">
                    {process.env.NEXT_PUBLIC_STACK_AI_API_URL || "Not configured"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[#97979B]">Supabase URL</span>
                  <span className="truncate text-xs">
                    {process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL || "Not configured"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[#97979B]">Connections</span>
                  <span className="truncate">
                    {connections ? connections.length : 0} found
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-grow">
              <table className="w-full">
                <thead>
                  <tr className="border-y border-[#EDEDF0] bg-[#FAFAFB] text-[#97979B]">
                    {logs.length > 0 ? (
                      <>
                        <td className="w-52 py-2 pl-4">Date</td>
                        <td>Status</td>
                        <td>Method</td>
                        <td className="hidden lg:table-cell">Path</td>
                        <td className="hidden lg:table-cell">Response</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 pl-4">Logs</td>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <tr key={`log-${index}-${log.date.getTime()}`}>
                        <td className="py-2 pl-4 font-[Fira_Code] text-xs">
                          {log.date.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>
                          {log.status >= 400 ? (
                            <div className="w-fit rounded-sm bg-[#FF453A3D] px-1 text-[#B31212] text-xs">
                              {log.status}
                            </div>
                          ) : (
                            <div className="w-fit rounded-sm bg-[#10B9813D] px-1 text-[#0A714F] text-xs">
                              {log.status}
                            </div>
                          )}
                        </td>
                        <td className="text-xs">{log.method}</td>
                        <td className="hidden lg:table-cell text-xs">{log.path}</td>
                        <td className="hidden font-[Fira_Code] lg:table-cell text-xs">
                          {log.response}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key="no-logs">
                      <td className="py-2 pl-4 font-[Fira_Code] text-xs">
                        There are no logs to show
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
    </div>
        </details>
      </aside>
    </main>
  );
}