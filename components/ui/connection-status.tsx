"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { Connection } from '@/lib/types/api';

interface ConnectionStatusProps {
  connections?: Connection[];
  isLoading: boolean;
  error?: Error | null;
}

export function ConnectionStatus({ connections, isLoading, error }: ConnectionStatusProps) {
  const isConnected = connections && connections.length > 0;

  return (
    <Card className="connection-status bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20 shadow-lg">
      <CardContent className="status-content p-6">
        <div className="status-layout flex items-center justify-between">
          
          {/* Left Side - DriveScope */}
          <div className="company-left flex items-center gap-4">
            <div className="logo-container relative">
              <div className="logo-square w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                <span className="logo-text text-white font-bold text-lg">DS</span>
              </div>
              {/* Particles around logo */}
              <div className="particles absolute inset-0 pointer-events-none">
                <div className="particle w-2 h-2 bg-primary/40 rounded-full absolute -top-1 -right-1 animate-pulse"></div>
                <div className="particle w-1.5 h-1.5 bg-primary/60 rounded-full absolute -bottom-1 -left-1 animate-pulse delay-300"></div>
                <div className="particle w-1 h-1 bg-primary/50 rounded-full absolute top-1 -left-2 animate-pulse delay-700"></div>
              </div>
            </div>
            <div className="company-info">
              <h3 className="company-name text-lg font-semibold text-foreground">DriveScope</h3>
              <p className="company-desc text-sm text-muted-foreground">File Picker Interface</p>
            </div>
          </div>

          {/* Center - Connection Status */}
          <div className="connection-indicator flex items-center gap-4">
            <div className="status-line relative">
              {/* Connection line */}
              <div className="connection-line w-24 h-0.5 bg-gradient-to-r from-primary to-blue-500 relative">
                {isConnected && (
                  <div className="pulse-dot w-2 h-2 bg-green-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse shadow-lg"></div>
                )}
              </div>
              
              {/* Status indicator */}
              <div className="status-badge absolute -top-6 left-1/2 transform -translate-x-1/2">
                {isLoading ? (
                  <Badge variant="secondary" className="status-loading">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Connecting...
                  </Badge>
                ) : error ? (
                  <Badge variant="destructive" className="status-error">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Error
                  </Badge>
                ) : isConnected ? (
                  <Badge variant="default" className="status-connected bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="status-disconnected">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    No Connection
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Google Drive */}
          <div className="company-right flex items-center gap-4">
            <div className="company-info text-right">
              <h3 className="company-name text-lg font-semibold text-foreground">Google Drive</h3>
              <p className="company-desc text-sm text-muted-foreground">Cloud Storage Provider</p>
            </div>
            <div className="logo-container relative">
              <div className="logo-square w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="logo-text text-white font-bold text-lg">GD</span>
              </div>
              {/* Particles around logo */}
              <div className="particles absolute inset-0 pointer-events-none">
                <div className="particle w-2 h-2 bg-blue-500/40 rounded-full absolute -top-1 -left-1 animate-pulse"></div>
                <div className="particle w-1.5 h-1.5 bg-blue-500/60 rounded-full absolute -bottom-1 -right-1 animate-pulse delay-300"></div>
                <div className="particle w-1 h-1 bg-blue-500/50 rounded-full absolute top-1 -right-2 animate-pulse delay-700"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {isConnected && (
          <div className="connection-details mt-4 pt-4 border-t border-primary/10">
            <div className="details-grid grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="detail-item flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Integration Active</span>
              </div>
              <div className="detail-item flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">API Responding</span>
              </div>
              <div className="detail-item flex items-center gap-2">
                <span className="connection-count font-medium text-primary">
                  {connections.length} Connection{connections.length !== 1 ? 's' : ''}
                </span>
                <span className="text-muted-foreground">Available</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Details */}
        {error && (
          <div className="error-details mt-4 pt-4 border-t border-destructive/10">
            <div className="error-message text-sm text-destructive">
              <strong>Connection Error:</strong> {error.message}
            </div>
            <Button variant="outline" size="sm" className="mt-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
