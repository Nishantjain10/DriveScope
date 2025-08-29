"use client";

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRef, useEffect, useCallback } from 'react';
import type { Connection } from '@/lib/types/api';

interface LogEntry {
  date: Date;
  method: string;
  path: string;
  status: number;
  response: string;
}

interface ConnectionLogsProps {
  logs: LogEntry[];
  showLogs: boolean;
  connections: Connection[] | undefined;
  onToggle: () => void;
}

export function ConnectionLogs({ logs, showLogs, connections }: ConnectionLogsProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const updateHeight = useCallback(() => {
    if (detailsRef.current) {
      // This will be handled by the parent component
      // const height = detailsRef.current.clientHeight;
      // You can emit this height to parent if needed
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

  return (
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
          <div className="icon text-xl flex items-center justify-center">
            {showLogs ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            )}
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
  );
}
