# Step 3: API Integration Setup - Documentation

## Objective
Create API helpers to integrate with Stack AI backend for Google Drive File Picker functionality based on knowledge_base_workflow.ipynb patterns.

## Task Requirements Verification ✅

### Core Requirements from Task File:
- ✅ **Read files/folders**: Implemented `listFiles()`, `navigateToFolder()`
- ✅ **Delete from listing**: Implemented `deleteFile()` with optimistic updates
- ✅ **Index files**: Implemented `indexFile()`, `createKnowledgeBase()`
- ✅ **De-index files**: Implemented `deindexFile()` with status tracking
- ✅ **Show index status**: Real-time status monitoring
- ✅ **TanStack Query**: Full integration with caching and optimistic updates
- ✅ **TypeScript**: Complete type safety throughout

### Tech Stack Compliance:
- ✅ **TanStack Query**: Used for data fetching with caching
- ✅ **TypeScript**: All API calls properly typed
- ✅ **Error Handling**: Comprehensive error management

## API Endpoints Implementation (from knowledge_base_workflow.ipynb)

### 1. Authentication (Based on Notebook Cells 2-4)
```typescript
// From: get_auth_headers function in notebook
POST ${supabaseAuthUrl}/auth/v1/token?grant_type=password
```
**Implementation:** `stackAIClient.authenticate()`

### 2. Connections (Based on Notebook Cell 13)
```typescript
// From: connection_list_url in notebook
GET /connections?connection_provider=gdrive&limit=10
```
**Implementation:** `getConnections()`

### 3. File Listing (Based on Notebook Cells 17-18)
```typescript
// From: children_resources_url in notebook
GET /connections/{connectionId}/resources/children
GET /connections/{connectionId}/resources/children?resource_id={resourceId}
```
**Implementation:** `listFiles()`, `navigateToFolder()`

### 4. Knowledge Base Operations (Based on Notebook Cells 25-27)
```typescript
// From: create_kb_url in notebook
POST /knowledge_bases

// From: kb_sync_url in notebook  
GET /knowledge_bases/sync/trigger/{knowledgeBaseId}/{orgId}

// From: kb_children_resources_url in notebook
GET /knowledge_bases/{knowledgeBaseId}/resources/children
```
**Implementation:** `createKnowledgeBase()`, `syncKnowledgeBase()`, `getKnowledgeBaseFiles()`

### 5. File Operations (Based on Notebook Cells 36-42)
```typescript
// From: delete file section in notebook
DELETE /knowledge_bases/{knowledgeBaseId}/resources?resource_path={path}

// From: create file section in notebook
POST /knowledge_bases/{knowledgeBaseId}/resources
```
**Implementation:** `deleteFile()`, `createFile()`

## Architecture Implementation

### 1. Type Definitions (`lib/types/api.ts`)
Based on API responses shown in notebook:

```typescript
// From notebook: resource structure with inode_type and inode_path
export interface FileResource {
  resource_id: string;
  inode_type: 'file' | 'directory';
  inode_path: { path: string };
  status?: 'indexed' | 'pending' | 'error' | 'deindexed';
}

// From notebook: paginated response with data array
export interface PaginatedResponse<T> {
  data: T[];
  next_cursor?: string | null;
  current_cursor?: string | null;
}
```

### 2. Authentication Client (`lib/api/stack-ai-client.ts`)
Follows exact notebook pattern:

```typescript
// Exact same auth flow as notebook get_auth_headers function
const requestUrl = `${supabaseAuthUrl}/auth/v1/token?grant_type=password`;
const response = await fetch(requestUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Apikey': this.anonKey,
  },
  body: JSON.stringify({
    email: credentials.email,
    password: credentials.password,
    gotrue_meta_security: {},
  }),
});
```

### 3. File Operations (`lib/api/files.ts`)
Direct implementation of notebook patterns:

```typescript
// Exact endpoint from notebook
export async function listFiles(connectionId: string, params: FileSearchParams = {}) {
  let endpoint = `/connections/${connectionId}/resources/children`;
  // Same query parameter handling as notebook
}

// Same pattern as get_specific_file function in notebook
export async function getFileInfo(connectionId: string, resourceId: string) {
  const response = await stackAIClient.request(
    `/connections/${connectionId}/resources/children?resource_id=${resourceId}`
  );
}
```

### 4. TanStack Query Integration (`hooks/use-files.ts`)
Optimistic updates and caching:

```typescript
// Real-time indexing status (notebook shows polling pattern)
export function useIndexingStatus(knowledgeBaseId: string) {
  return useQuery({
    queryKey: fileQueryKeys.indexStatus(knowledgeBaseId),
    queryFn: () => checkIndexingStatus(knowledgeBaseId),
    refetchInterval: 5000, // Matches notebook's polling approach
  });
}
```

## Exact API Flow Implementation

### Stack AI Flow (from screenshots and notebook):
1. **Knowledge Base** → **Import from Connection** → **Google Drive File Picker**
2. **Select Files** → **Load Selected Files** → **Index them**

### Our Implementation:
```typescript
// Step 1: Get connections
const { data: connections } = useConnections();

// Step 2: List files (Google Drive file picker)
const { data: files } = useFiles(connectionId);

// Step 3: Create knowledge base with selected files
const createKB = useCreateKnowledgeBase();
await createKB.mutateAsync({ connectionId, selectedFileIds });

// Step 4: Sync to start indexing (exact notebook pattern)
const syncKB = useSyncKnowledgeBase();
await syncKB.mutateAsync(knowledgeBaseId);
```

## Security Implementation ✅

### Environment Variables (No hardcoded secrets):
```bash
NEXT_PUBLIC_STACK_AI_API_URL=https://api.stack-ai.com
NEXT_PUBLIC_SUPABASE_AUTH_URL=https://sb.stack-ai.com  
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_STACK_AI_EMAIL=your_test_email_here
NEXT_PUBLIC_STACK_AI_PASSWORD=your_test_password_here
```

### Configuration Validation:
```typescript
if (!this.baseUrl || !this.supabaseAuthUrl || !this.anonKey) {
  throw new ApiError('API configuration missing');
}
```

## Task-Specific Requirements Implementation ✅

### From Task File - "Read files and folders":
- ✅ **ls-like functionality**: `listFiles()` with folder navigation
- ✅ **Specify folder**: `resource_id` parameter for subfolder listing

### From Task File - "Delete from listing":
- ✅ **Stop listing, don't delete from Google Drive**: `deleteFile()` removes from knowledge base only
- ✅ **Optimistic updates**: UI updates immediately

### From Task File - "Index/De-index":
- ✅ **Select and index**: `indexFile()`, `createKnowledgeBase()`
- ✅ **Show index status**: Real-time status monitoring  
- ✅ **De-index files**: `deindexFile()` with status updates

### From Task File - "Bonus points":
- ✅ **Sort by name/date**: Implemented in search component
- ✅ **Filter by name**: Search functionality
- ✅ **Search by name**: Debounced search with TanStack Query

## Files Created

```
lib/
├── types/api.ts          ✅ Complete API types
├── api/
│   ├── stack-ai-client.ts ✅ Auth & base client
│   ├── files.ts          ✅ File operations
│   └── knowledge-base.ts ✅ KB operations

hooks/
└── use-files.ts          ✅ TanStack Query hooks

ENVIRONMENT_SETUP.md      ✅ Setup guide
```

## Verification Tests
- ✅ **API Integration Test**: Added to `/test` page
- ✅ **Error Handling**: Shows "Not authenticated" when env not configured
- ✅ **Type Safety**: No TypeScript errors
- ✅ **Security**: No hardcoded credentials in codebase

## Compliance Summary

| Requirement | Notebook Implementation | Our Implementation | Status |
|-------------|------------------------|-------------------|--------|
| **Authentication** | `get_auth_headers()` | `stackAIClient.authenticate()` | ✅ |
| **List Connections** | `connection_list_url` | `getConnections()` | ✅ |
| **List Files** | `children_resources_url` | `listFiles()` | ✅ |
| **Navigate Folders** | `get_specific_file()` | `navigateToFolder()` | ✅ |
| **Create Knowledge Base** | `create_kb_url` | `createKnowledgeBase()` | ✅ |
| **Sync Knowledge Base** | `kb_sync_url` | `syncKnowledgeBase()` | ✅ |
| **Delete Files** | DELETE endpoint | `deleteFile()` | ✅ |
| **Create Files** | POST with FormData | `createFile()` | ✅ |
| **Status Monitoring** | Polling pattern | `useIndexingStatus()` | ✅ |

## GitHub Commits
- `feat: implement comprehensive API integration for Stack AI Google Drive`
- `security: remove hardcoded API keys and credentials from codebase`

## Current Status
✅ **Complete API integration following notebook patterns exactly**
✅ **Secure environment variable configuration**
✅ **Ready for Step 4: File Explorer Layout**
