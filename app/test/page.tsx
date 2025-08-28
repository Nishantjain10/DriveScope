import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileIcon, FolderIcon, Search, Settings } from "lucide-react"

export default function TestPage() {
  return (
    <div className="test-page min-h-screen bg-background p-8">
      {/* Header Section */}
      <div className="test-header mb-8">
        <h1 className="page-title text-3xl font-bold text-foreground mb-2">
          DriveScope Component Test
        </h1>
        <p className="page-subtitle text-muted-foreground">
          Testing Shadcn UI components with Stack AI inspired design
        </p>
      </div>

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

      {/* Alert Section */}
      <div className="alerts-section mt-8">
        <Alert className="success-alert mb-4">
          <AlertDescription className="alert-text">
            ✅ All Shadcn UI components are working correctly! Ready for File Picker implementation.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
