"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FolderOpen, 
  Database, 
  Zap, 
  ArrowRight,
  Settings,
  HelpCircle
} from 'lucide-react';

export function FileExplorerHeader() {
  return (
    <div className="explorer-header bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
      <div className="header-content container mx-auto px-4 py-8">
        <div className="header-layout flex items-center justify-between">
          
          {/* Left Side - Title & Description */}
          <div className="title-section">
            <div className="title-group flex items-center gap-3 mb-2">
              <div className="icon-container p-2 bg-primary/10 rounded-lg">
                <FolderOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="title-text">
                <h1 className="page-title text-3xl font-bold text-foreground">
                  Google Drive File Picker
                </h1>
                <p className="page-subtitle text-muted-foreground">
                  Manage and index your Google Drive files with Stack AI
                </p>
              </div>
            </div>
            
            {/* Feature Pills */}
            <div className="features-list flex items-center gap-2 mt-4">
              <Badge variant="secondary" className="feature-badge">
                <Database className="w-3 h-3 mr-1" />
                Smart Indexing
              </Badge>
              <Badge variant="secondary" className="feature-badge">
                <Zap className="w-3 h-3 mr-1" />
                Real-time Sync
              </Badge>
              <Badge variant="secondary" className="feature-badge">
                Advanced Search
              </Badge>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="actions-section">
            <div className="action-buttons flex items-center gap-3">
              <Button variant="outline" size="sm" className="help-btn">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
              <Button variant="outline" size="sm" className="settings-btn">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Workflow Indicator */}
        <div className="workflow-indicator mt-6 p-4 bg-card/50 backdrop-blur rounded-lg border">
          <div className="workflow-content flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="step-item flex items-center gap-2">
              <div className="step-icon w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="step-number text-xs font-medium text-primary">1</span>
              </div>
              <span>Connect to Google Drive</span>
            </div>
            
            <ArrowRight className="w-4 h-4" />
            
            <div className="step-item flex items-center gap-2">
              <div className="step-icon w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="step-number text-xs font-medium text-primary">2</span>
              </div>
              <span>Browse & Select Files</span>
            </div>
            
            <ArrowRight className="w-4 h-4" />
            
            <div className="step-item flex items-center gap-2">
              <div className="step-icon w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="step-number text-xs font-medium text-primary">3</span>
              </div>
              <span>Index for Knowledge Base</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
