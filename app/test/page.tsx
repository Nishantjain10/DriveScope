"use client"

import "../app.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileSearchBar, type FileSearchFilters } from "@/components/ui/file-search-bar"
import { useConnections, useAuthentication } from "@/hooks/use-files"
import { FileIcon, FolderIcon, Search, Settings, Loader2, Key, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"

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
    <div className="test-page checker-background bg-[#FAFAFB] min-h-screen p-5 relative">
      {/* Elegant Bordered Container */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="rounded-lg border border-[#19191C0A] bg-[#F9F9FA] p-4 shadow-[0px_9.36px_9.36px_0px_hsla(0,0%,0%,0.04)]">
          <div className="rounded-lg border border-[#FAFAFB] bg-white shadow-[0px_2px_12px_0px_hsla(0,0%,0%,0.03)] overflow-hidden">
            
            {/* Modern Header */}
            <div className="test-header bg-white border-b border-[#EDEDF0] px-6 py-4">
              <div className="header-content flex items-center justify-between">
                <div className="header-left flex items-center gap-4">
                  <Link href="/" className="back-button text-[#5F6368] hover:text-zinc-700 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <div>
                    <h1 className="page-title text-xl font-normal text-[#202124]">
                      DriveScope Component Test
                    </h1>
                    <p className="page-subtitle text-sm text-[#5F6368]">
                      Testing UI components for Google Drive File Picker interface
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* File Search Demo */}
            <div className="search-demo-section bg-white border-b border-[#EDEDF0] px-6 py-4">
              <div className="section-header mb-4">
                <h2 className="section-title text-lg font-medium text-[#202124] mb-2">
                  File Search & Filters
                </h2>
                <p className="section-description text-sm text-[#5F6368]">
                  Advanced search with filtering and sorting for Google Drive File Picker
                </p>
              </div>
              <div className="section-content">
                <FileSearchBar 
                  onFiltersChange={handleFiltersChange}
                  placeholder="Search your Google Drive files..."
                  className="search-demo"
                />
              </div>
            </div>

            {/* Component Grid */}
            <div className="components-grid bg-white border-b border-[#EDEDF0] px-6 py-4">
              <div className="section-header mb-4">
                <h2 className="section-title text-lg font-medium text-[#202124] mb-2">
                  UI Components
                </h2>
                <p className="section-description text-sm text-[#5F6368]">
                  Various button styles, inputs, and interactive elements
                </p>
              </div>
              
              <div className="components-content grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Buttons Section */}
                <div className="buttons-section">
                  <h3 className="subsection-title text-md font-medium text-[#202124] mb-3">Buttons & Actions</h3>
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
                </div>

                {/* Input & Search Section */}
                <div className="input-section">
                  <h3 className="subsection-title text-md font-medium text-[#202124] mb-3">Search & Input</h3>
                  <div className="space-y-3">
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
                  </div>
                </div>

                {/* Status Badges Section */}
                <div className="badges-section">
                  <h3 className="subsection-title text-md font-medium text-[#202124] mb-3">File Status</h3>
                  <div className="badge-group flex flex-wrap gap-2">
                    <Badge className="indexed-badge" variant="secondary">
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
                </div>

                {/* Dialog Test Section */}
                <div className="dialog-section">
                  <h3 className="subsection-title text-md font-medium text-[#202124] mb-3">Dialogs & Modals</h3>
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
                </div>
              </div>
            </div>

            {/* Sample File Table */}
            <div className="table-section bg-white border-b border-[#EDEDF0] px-6 py-4">
              <div className="section-header mb-4">
                <h2 className="section-title text-lg font-medium text-[#202124] mb-2">
                  File Explorer Preview
                </h2>
                <p className="section-description text-sm text-[#5F6368]">
                  Sample file listing with Stack AI inspired styling
                </p>
              </div>
              <div className="section-content">
                <Table className="files-table">
                  <TableHeader>
                    <TableRow className="table-header-row border-b border-[#EDEDF0] bg-[#F8F9FA]">
                      <TableHead className="name-column text-[#5F6368] font-medium">Name</TableHead>
                      <TableHead className="type-column text-[#5F6368] font-medium">Type</TableHead>
                      <TableHead className="status-column text-[#5F6368] font-medium">Status</TableHead>
                      <TableHead className="actions-column text-[#5F6368] font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="file-row hover:bg-[#F8F9FA] border-b border-[#EDEDF0]">
                      <TableCell className="name-cell">
                        <div className="file-info flex items-center gap-2">
                          <FolderIcon className="folder-icon w-4 h-4 text-[#5F6368]" />
                          <span className="file-name text-[#202124] text-sm">Documents</span>
                        </div>
                      </TableCell>
                      <TableCell className="type-cell text-[#5F6368] text-sm">Folder</TableCell>
                      <TableCell className="status-cell">
                        <Badge className="indexed-badge" variant="default">✅ Indexed</Badge>
                      </TableCell>
                      <TableCell className="actions-cell">
                        <Button className="action-btn" size="sm" variant="ghost">View</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="file-row hover:bg-[#F8F9FA] border-b border-[#EDEDF0]">
                      <TableCell className="name-cell">
                        <div className="file-info flex items-center gap-2">
                          <FileIcon className="file-icon w-4 h-4 text-[#5F6368]" />
                          <span className="file-name text-[#202124] text-sm">Important Notes.txt</span>
                        </div>
                      </TableCell>
                      <TableCell className="type-cell text-[#5F6368] text-sm">File</TableCell>
                      <TableCell className="status-cell">
                        <Badge className="pending-badge" variant="secondary">⏳ Pending</Badge>
                      </TableCell>
                      <TableCell className="actions-cell">
                        <Button className="action-btn" size="sm" variant="ghost">Index</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="file-row hover:bg-[#F8F9FA] border-b border-[#EDEDF0]">
                      <TableCell className="name-cell">
                        <div className="file-info flex items-center gap-2">
                          <FileIcon className="file-icon w-4 h-4 text-[#5F6368]" />
                          <span className="file-name text-[#202124] text-sm">Project Proposal.pdf</span>
                        </div>
                      </TableCell>
                      <TableCell className="type-cell text-[#5F6368] text-sm">File</TableCell>
                      <TableCell className="status-cell">
                        <Badge className="deindexed-badge" variant="outline">↩️ De-Indexed</Badge>
                      </TableCell>
                      <TableCell className="actions-cell">
                        <Button className="action-btn" size="sm" variant="ghost">Re-Index</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* API Integration Test */}
            <div className="api-test-section bg-white border-b border-[#EDEDF0] px-6 py-4">
              <div className="section-header mb-4">
                <h2 className="section-title text-lg font-medium text-[#202124] mb-2">
                  API Integration Test
                </h2>
                <p className="section-description text-sm text-[#5F6368]">
                  Testing Google Drive connections with authentication
                </p>
              </div>
              <div className="section-content space-y-4">
                
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
                <div className="env-check bg-[#F8F9FA] p-3 rounded-md text-sm border border-[#EDEDF0]">
                  <p className="font-medium mb-2 text-[#202124]">Environment Check:</p>
                  <ul className="space-y-1 text-xs text-[#5F6368]">
                    <li>API URL: {process.env.STACK_AI_API_URL ? '✅' : '❌'} {process.env.STACK_AI_API_URL || 'Not set'}</li>
                                <li>Supabase URL: {process.env.SUPABASE_AUTH_URL ? '✅' : '❌'} {process.env.SUPABASE_AUTH_URL || 'Not set'}</li>
            <li>Anon Key: {process.env.SUPABASE_ANON_KEY ? '✅' : '❌'} {process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</li>
                                <li>Test Email: {process.env.STACK_AI_EMAIL ? '✅' : '❌'} {process.env.STACK_AI_EMAIL || 'Not set'}</li>
            <li>Test Password: {process.env.STACK_AI_PASSWORD ? '✅' : '❌'} {process.env.STACK_AI_PASSWORD ? 'Set' : 'Not set'}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Alert Section */}
            <div className="alerts-section bg-white px-6 py-4">
              <Alert className="success-alert">
                <AlertDescription className="alert-text">
                  ✅ All Shadcn UI components and API integration are ready for File Picker implementation!
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
