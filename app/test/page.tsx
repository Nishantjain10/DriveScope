"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileSearchBar, type FileSearchFilters } from "@/components/ui/file-search-bar"
import { useConnections, useAuthentication } from "@/hooks/use-files"
import { FileIcon, FolderIcon, Search, Settings, Loader2, Key, RefreshCw } from "lucide-react"

export default function TestPage() {
  const handleFiltersChange = (filters: FileSearchFilters) => {
    console.log('Search filters changed:', filters);
  };

  // Authentication hook
  const authentication = useAuthentication();
  
  // Test API integration 
  const { 
    data: connections, 
    isLoading: connectionsLoading, 
    error: connectionsError,
    refetch: refetchConnections 
  } = useConnections();

  const handleTestAuth = () => {
    console.log('🧪 Testing authentication...');
    authentication.mutate();
  };

  const handleRefreshConnections = () => {
    console.log('🔄 Refreshing connections...');
    refetchConnections();
  };

  return (
    <div className="test-page min-h-screen bg-background p-8">
      {/* Header Section */}
      <div className="test-header mb-8">
        <h1 className="page-title text-3xl font-bold text-foreground mb-2">
          DriveScope Component Test
        </h1>
        <p className="page-subtitle text-muted-foreground">
          Testing UI components for Google Drive File Picker interface
        </p>
      </div>

      {/* File Search Demo */}
      <Card className="search-demo-card mb-8">
        <CardHeader>
          <CardTitle className="card-title">File Search & Filters</CardTitle>
          <CardDescription>
            Advanced search with filtering and sorting for Google Drive File Picker
          </CardDescription>
        </CardHeader>
        <CardContent className="card-content pt-6">
          <FileSearchBar 
            onFiltersChange={handleFiltersChange}
            placeholder="Search your Google Drive files..."
            className="search-demo"
          />
        </CardContent>
      </Card>

      {/* Component Grid */}
      <div className="components-grid grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Buttons Card */}
        <Card className="buttons-card">
          <CardHeader>
            <CardTitle className="card-title">Buttons & Actions</CardTitle>
            <CardDescription>
              Various button styles for file operations
            </CardDescription>
          </CardHeader>
          <CardContent className="card-content space-y-4">
            <div className="button-group flex flex-wrap gap-2">
              <Button className="primary-btn" variant="default">
                Index File
              </Button>
              <Button className="secondary-btn" variant="secondary">
                De-Index
              </Button>
              <Button className="destructive-btn" variant="destructive">
                Delete
              </Button>
              <Button className="outline-btn" variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Input & Search Card */}
        <Card className="input-card">
          <CardHeader>
            <CardTitle className="card-title">Search & Input</CardTitle>
            <CardDescription>
              File search and filtering controls
            </CardDescription>
          </CardHeader>
          <CardContent className="card-content space-y-4">
            <div className="search-group relative">
              <Search className="search-icon absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                className="search-input pl-10" 
                placeholder="Search files and folders..."
                type="search"
              />
            </div>
            <Input 
              className="filter-input" 
              placeholder="Filter by name or type..."
            />
          </CardContent>
        </Card>

        {/* Status Badges Card */}
        <Card className="badges-card">
          <CardHeader>
            <CardTitle className="card-title">File Status</CardTitle>
            <CardDescription>
              Different states of file indexing
            </CardDescription>
          </CardHeader>
          <CardContent className="card-content">
            <div className="badge-group flex flex-wrap gap-2">
              <Badge className="indexed-badge" variant="default">
                ✅ Indexed
              </Badge>
              <Badge className="pending-badge" variant="secondary">
                ⏳ Pending
              </Badge>
              <Badge className="error-badge" variant="destructive">
                ❌ Error
              </Badge>
              <Badge className="deindexed-badge" variant="outline">
                ↩️ De-Indexed
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dialog Test Card */}
        <Card className="dialog-card">
          <CardHeader>
            <CardTitle className="card-title">Dialogs & Modals</CardTitle>
            <CardDescription>
              Confirmation and action dialogs
            </CardDescription>
          </CardHeader>
          <CardContent className="card-content">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="dialog-trigger" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Open Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="dialog-content">
                <DialogHeader>
                  <DialogTitle className="dialog-title">File Picker Settings</DialogTitle>
                  <DialogDescription className="dialog-description">
                    Configure your file indexing preferences.
                  </DialogDescription>
                </DialogHeader>
                <div className="dialog-body p-4">
                  <p className="text-sm text-muted-foreground">
                    Dialog content goes here...
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Sample File Table */}
      <Card className="table-card">
        <CardHeader>
          <CardTitle className="card-title">File Explorer Preview</CardTitle>
          <CardDescription>
            Sample file listing with Stack AI inspired styling
          </CardDescription>
        </CardHeader>
        <CardContent className="card-content">
          <Table className="files-table">
            <TableHeader>
              <TableRow className="table-header-row">
                <TableHead className="name-column">Name</TableHead>
                <TableHead className="type-column">Type</TableHead>
                <TableHead className="status-column">Status</TableHead>
                <TableHead className="actions-column">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="file-row">
                <TableCell className="name-cell">
                  <div className="file-info flex items-center gap-2">
                    <FolderIcon className="folder-icon w-4 h-4 text-blue-600" />
                    <span className="file-name">Documents</span>
                  </div>
                </TableCell>
                <TableCell className="type-cell">Folder</TableCell>
                <TableCell className="status-cell">
                  <Badge className="indexed-badge" variant="default">✅ Indexed</Badge>
                </TableCell>
                <TableCell className="actions-cell">
                  <Button className="action-btn" size="sm" variant="ghost">View</Button>
                </TableCell>
              </TableRow>
              <TableRow className="file-row">
                <TableCell className="name-cell">
                  <div className="file-info flex items-center gap-2">
                    <FileIcon className="file-icon w-4 h-4 text-gray-600" />
                    <span className="file-name">Important Notes.txt</span>
                  </div>
                </TableCell>
                <TableCell className="type-cell">File</TableCell>
                <TableCell className="status-cell">
                  <Badge className="pending-badge" variant="secondary">⏳ Pending</Badge>
                </TableCell>
                <TableCell className="actions-cell">
                  <Button className="action-btn" size="sm" variant="ghost">Index</Button>
                </TableCell>
              </TableRow>
              <TableRow className="file-row">
                <TableCell className="name-cell">
                  <div className="file-info flex items-center gap-2">
                    <FileIcon className="file-icon w-4 h-4 text-gray-600" />
                    <span className="file-name">Project Proposal.pdf</span>
                  </div>
                </TableCell>
                <TableCell className="type-cell">File</TableCell>
                <TableCell className="status-cell">
                  <Badge className="deindexed-badge" variant="outline">↩️ De-Indexed</Badge>
                </TableCell>
                <TableCell className="actions-cell">
                  <Button className="action-btn" size="sm" variant="ghost">Re-Index</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* API Integration Test */}
      <Card className="api-test-card mb-8">
        <CardHeader>
          <CardTitle className="card-title">API Integration Test</CardTitle>
          <CardDescription>
            Testing Google Drive connections with authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="card-content space-y-4">
          
          {/* Test Buttons */}
          <div className="test-buttons flex flex-wrap gap-2">
            <Button 
              onClick={handleTestAuth}
              disabled={authentication.isPending}
              className="auth-test-btn"
              variant="outline"
            >
              {authentication.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Key className="w-4 h-4 mr-2" />
              )}
              Test Authentication
            </Button>
            
            <Button 
              onClick={handleRefreshConnections}
              disabled={connectionsLoading}
              className="refresh-btn"
              variant="outline"
            >
              {connectionsLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh Connections
            </Button>
          </div>

          {/* Authentication Status */}
          {authentication.isPending && (
            <div className="auth-loading flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating with Stack AI...</span>
            </div>
          )}

          {authentication.isSuccess && (
            <Alert className="success-alert">
              <AlertDescription className="alert-text">
                ✅ Authentication successful! Access token received.
              </AlertDescription>
            </Alert>
          )}

          {authentication.error && (
            <Alert className="error-alert">
              <AlertDescription className="alert-text">
                ❌ Authentication failed: {authentication.error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Connection Status */}
          {connectionsLoading && (
            <div className="loading-state flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading connections...</span>
            </div>
          )}
          
          {connectionsError && (
            <Alert className="error-alert">
              <AlertDescription className="alert-text">
                ❌ Connection error: {connectionsError.message}
                <br />
                <span className="text-xs mt-1 block">
                  Check console for detailed error logs and environment variables.
                </span>
              </AlertDescription>
            </Alert>
          )}
          
          {connections && connections.length > 0 && (
            <Alert className="success-alert">
              <AlertDescription className="alert-text">
                ✅ Found {connections.length} Google Drive connection(s)!
                <br />
                <span className="text-xs mt-1 block">
                  Connection ID: {connections[0].connection_id}
                </span>
              </AlertDescription>
            </Alert>
          )}
          
          {connections && connections.length === 0 && (
            <Alert className="info-alert">
              <AlertDescription className="alert-text">
                ℹ️ No Google Drive connections found. Create one in Stack AI dashboard.
              </AlertDescription>
            </Alert>
          )}

          {/* Environment Check */}
          <div className="env-check bg-muted p-3 rounded-md text-sm">
            <p className="font-medium mb-2">Environment Check:</p>
            <ul className="space-y-1 text-xs">
              <li>API URL: {process.env.NEXT_PUBLIC_STACK_AI_API_URL ? '✅' : '❌'} {process.env.NEXT_PUBLIC_STACK_AI_API_URL || 'Not set'}</li>
              <li>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL ? '✅' : '❌'} {process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL || 'Not set'}</li>
              <li>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'} {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</li>
              <li>Test Email: {process.env.NEXT_PUBLIC_STACK_AI_EMAIL ? '✅' : '❌'} {process.env.NEXT_PUBLIC_STACK_AI_EMAIL || 'Not set'}</li>
              <li>Test Password: {process.env.NEXT_PUBLIC_STACK_AI_PASSWORD ? '✅' : '❌'} {process.env.NEXT_PUBLIC_STACK_AI_PASSWORD ? 'Set' : 'Not set'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Alert Section */}
      <div className="alerts-section mt-8">
        <Alert className="success-alert mb-4">
          <AlertDescription className="alert-text">
            ✅ All Shadcn UI components and API integration are ready for File Picker implementation!
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
