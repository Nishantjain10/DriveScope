"use client";

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Code, AlertTriangle } from 'lucide-react';

/**
 * ⚠️ DEVELOPMENT ONLY ⚠️
 * This component allows toggling between dev mode and production mode.
 * TODO: Remove this component and its imports before deploying to production.
 */

export function DevModeToggle() {
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // Check initial state - prioritize manual override over NODE_ENV
    const stored = localStorage.getItem('forceDevMode');
    if (stored !== null) {
      // User has manually set a preference
      setIsDevMode(stored === 'true');
    } else {
      // Default to NODE_ENV only if no manual preference
      setIsDevMode(process.env.NODE_ENV === 'development');
    }
  }, []);

  const handleToggle = (checked: boolean) => {
    setIsDevMode(checked);
    localStorage.setItem('forceDevMode', checked.toString());
    
    // Reload page to apply changes
    if (checked !== (process.env.NODE_ENV === 'development')) {
      console.log('🔄 Reloading page to apply dev mode changes...');
      window.location.reload();
    }
  };

  // Only show in development or when explicitly enabled
  if (process.env.NODE_ENV === 'production' && !isDevMode) {
    return null;
  }

  return (
    <Card className="dev-mode-toggle fixed bottom-4 right-4 z-50 max-w-xs shadow-lg border-orange-200 bg-orange-50">
      <CardContent className="dev-toggle-content p-4">
        <div className="toggle-header flex items-center gap-2 mb-3">
          <Code className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-800">Developer Mode</span>
          <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
            {isDevMode ? 'MOCK' : 'LIVE'}
          </Badge>
        </div>
        
        <div className="toggle-controls flex items-center justify-between">
          <div className="toggle-info text-xs text-orange-700">
            {isDevMode ? 'Using mock API data' : 'Using real API calls'}
          </div>
          <Switch 
            checked={isDevMode}
            onCheckedChange={handleToggle}
            className="toggle-switch"
          />
        </div>
        
        {isDevMode && (
          <div className="warning-notice flex items-center gap-1 mt-2 p-2 bg-orange-100 rounded text-xs text-orange-800">
            <AlertTriangle className="w-3 h-3" />
            <span>Remove before production!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
