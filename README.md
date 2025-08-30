# 🚀 DriveScope - File Management System

> **A modern file management system built with Next.js, TypeScript, and TanStack Query. Features file exploration, navigation, and integration with cloud storage providers.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

## 📖 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🔧 Development](#-development)
- [📱 API Reference](#-api-reference)
- [🎨 UI Components](#-ui-components)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

### 🔐 **Authentication & Security**
- **Supabase Integration**: Secure authentication with Supabase
- **API Key Management**: Server-side API key handling
- **Session Management**: User session handling with tokens

### 📁 **File Management**
- **File Explorer Interface**: Modern file browser with grid and list views
- **Folder Navigation**: Deep folder exploration with breadcrumb navigation
- **File Type Recognition**: Automatic icon detection for different file types
- **Bulk Operations**: Select multiple files for batch processing
- **File Status Tracking**: Monitor indexing and processing status

### 🔍 **Search & Organization**
- **Advanced Search**: File search with multiple filter options
- **Sorting Capabilities**: Sort by name, date, size, and status
- **View Modes**: Toggle between grid and list views
- **Responsive Design**: Mobile-first approach with cross-device compatibility

### 🎯 **Cloud Storage Integration**
- **Multi-Provider Support**: Google Drive, OneDrive, Dropbox
- **Connection Management**: Manage multiple cloud storage connections
- **File Synchronization**: Keep local and cloud files in sync

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.17 or later
- **npm** 9.0 or later
- **Supabase** account for authentication
- **Stack AI** account for API access

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/drivescope.git
cd drivescope

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Configuration

```bash
# .env.local
# CLIENT-SIDE VARIABLES (Public - exposed to browser)
NEXT_PUBLIC_STACK_AI_API_URL=https://api.stack-ai.com
NEXT_PUBLIC_SUPABASE_AUTH_URL=https://sb.stack-ai.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STACK_AI_EMAIL=your_stack_ai_email
NEXT_PUBLIC_STACK_AI_PASSWORD=your_stack_ai_password
```

**🔒 Security Note**: Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. All sensitive data (API keys, secrets) are kept server-side and accessed through secure API routes.

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

**🌐 Open [http://localhost:3000](http://localhost:3000) in your browser**

## 🛠️ Tech Stack

### **Frontend Framework**
- **[Next.js 15.5.2](https://nextjs.org/)** - React framework with App Router
- **[React 19.1.0](https://reactjs.org/)** - Modern React with concurrent features
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Type-safe JavaScript

### **Styling & UI**
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations

### **State Management & Data Fetching**
- **[TanStack Query 5.0](https://tanstack.com/query)** - Powerful data synchronization
- **[React Hooks](https://reactjs.org/docs/hooks-intro.html)** - Custom hooks for state management
- **[Class Variance Authority](https://cva.style/)** - Component variant management

### **Development Tools**
- **[ESLint](https://eslint.org/)** - Code quality and consistency
- **[PostCSS](https://postcss.org/)** - CSS processing
- **[TypeScript](https://www.typescriptlang.org/)** - Type checking

## 🏗️ Architecture

### **Design Principles**
- **SOLID Principles**: Clean, maintainable, and scalable code architecture
- **Component Composition**: Reusable, focused components with clear responsibilities
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Performance First**: Optimized rendering with React best practices

### **State Management Strategy**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Components │◄──►│  Custom Hooks    │◄──►│  TanStack Query │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Local State     │
                       │  (useState)      │
                       └──────────────────┘
```

### **Data Flow**
1. **API Layer**: Centralized API client with error handling
2. **Query Layer**: TanStack Query for server state management
3. **Hook Layer**: Custom hooks for business logic encapsulation
4. **Component Layer**: Pure UI components with minimal logic

## 📁 Project Structure

```
drivescope/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # API routes
│   │   └── 📁 auth/                 # Authentication endpoints
│   │       └── 📄 route.ts          # Auth proxy to Supabase
│   ├── 📁 files/                    # File explorer page
│   │   └── 📄 page.tsx              # Main file management interface
│   ├── 📁 test/                     # Component testing page
│   ├── 📄 layout.tsx                # Root layout with providers
│   ├── 📄 page.tsx                  # Homepage with provider selection
│   ├── 📄 app.css                   # Application styles
│   └── 📄 globals.css               # Global styles
├── 📁 components/                   # Reusable UI components
│   ├── 📁 ui/                       # Core UI components
│   │   ├── 📄 button.tsx            # Button component with variants
│   │   ├── 📄 table.tsx             # Data table component
│   │   ├── 📄 input.tsx             # Input field component
│   │   ├── 📄 badge.tsx             # Status badge component
│   │   ├── 📄 dialog.tsx            # Modal dialog component
│   │   ├── 📄 dropdown-menu.tsx     # Dropdown menu component
│   │   ├── 📄 switch.tsx            # Toggle switch component
│   │   ├── 📄 card.tsx              # Card container component
│   │   ├── 📄 alert.tsx             # Alert/notification component
│   │   ├── 📄 loading-bar.tsx       # Loading progress indicator
│   │   ├── 📄 navigation.tsx        # Navigation component
│   │   ├── 📄 breadcrumb-nav.tsx    # Breadcrumb navigation
│   │   ├── 📄 dock.tsx              # Provider selection dock
│   │   ├── 📄 provider-dock.tsx     # Cloud provider dock
│   │   ├── 📄 hero-section.tsx      # Hero section component
│   │   ├── 📄 status-section.tsx    # Status display section
│   │   ├── 📄 connection-logs.tsx   # Connection activity logs
│   │   ├── 📄 connection-status.tsx # Connection status display
│   │   ├── 📄 file-actions.tsx      # File action buttons
│   │   ├── 📄 file-explorer-header.tsx # File explorer header
│   │   ├── 📄 file-search-bar.tsx   # Search and filter interface
│   │   ├── 📄 file-type-icon.tsx    # File type icon display
│   │   ├── 📄 file-grid-view.tsx    # Grid view for files
│   │   ├── 📄 file-list-view.tsx    # List view for files
│   │   ├── 📄 file-skeleton.tsx     # Loading skeleton for files
│   │   └── 📄 dynamic-footer.tsx    # Dynamic selection footer
│   └── 📄 index.ts                  # Component exports
├── 📁 hooks/                        # Custom React hooks
│   ├── 📄 use-file-explorer.ts      # Main file explorer logic (legacy)
│   ├── 📄 use-file-explorer-refactored.ts # Refactored main hook
│   ├── 📄 use-files.ts              # File data management with TanStack Query
│   ├── 📄 use-file-state.ts         # File state management
│   ├── 📄 use-navigation-state.ts   # Navigation state management
│   ├── 📄 use-file-operations.ts    # File operations (index, deindex, remove)
│   ├── 📄 use-file-selection.ts     # File selection logic
│   ├── 📄 use-file-navigation.ts    # File navigation and folder management
│   ├── 📄 use-file-utils.ts         # File utility functions
│   ├── 📄 use-file-filters.ts       # File filtering and sorting
│   ├── 📄 use-folder-expansion.ts   # Folder expansion management
│   └── 📄 use-file-explorer-refactored.test.ts # Hook testing
├── 📁 lib/                          # Utility libraries
│   ├── 📁 api/                      # API client and functions
│   │   ├── 📄 files.ts              # File operations API
│   │   ├── 📄 knowledge-base.ts     # Knowledge base API operations
│   │   └── 📄 stack-ai-client.ts    # Stack AI API client
│   ├── 📁 types/                    # TypeScript type definitions
│   │   └── 📄 api.ts                # API response and request types
│   ├── 📄 query-client.ts           # TanStack Query client configuration
│   └── 📄 utils.ts                  # Utility functions
├── 📁 public/                       # Static assets
│   ├── 📄 drive.svg                 # Google Drive icon
│   ├── 📄 dropbox-icon.svg          # Dropbox icon
│   ├── 📄 ms-onedrive.svg           # OneDrive icon
│   ├── 📄 file.svg                  # File icon
│   ├── 📄 folder.svg                # Folder icon
│   ├── 📄 globe.svg                 # Globe icon
│   ├── 📄 stackai.svg               # Stack AI icon
│   └── 📄 vercel.svg                # Vercel icon
├── 📄 .eslintrc.json                # ESLint configuration
├── 📄 .gitignore                    # Git ignore rules
├── 📄 next.config.ts                # Next.js configuration
├── 📄 package.json                  # Dependencies and scripts
├── 📄 postcss.config.mjs            # PostCSS configuration
├── 📄 tailwind.config.ts            # Tailwind CSS configuration
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 components.json               # Shadcn/ui components configuration
├── 📄 ENVIRONMENT_SETUP.md          # Environment setup guide
└── 📄 README.md                     # This file
```

## 🔧 Development

### **Code Quality Standards**

#### **TypeScript Best Practices**
- Strict type checking enabled
- Proper interface definitions for all API responses
- Generic type usage where appropriate
- No `any` types allowed

#### **React Best Practices**
- Functional components with hooks
- Proper dependency arrays in useEffect
- Memoization for expensive operations
- Clean component composition

#### **CSS Architecture**
- Utility-first approach with Tailwind CSS
- Custom CSS classes for complex components
- Consistent spacing and color system
- Responsive design patterns

### **Development Workflow**

```bash
# 1. Create feature branch
git checkout -b feature/amazing-feature

# 2. Make changes and test
npm run dev
npm run lint

# 3. Commit with conventional commits
git commit -m "feat: add amazing new feature"

# 4. Push and create PR
git push origin feature/amazing-feature
```

### **Conventional Commits**
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process changes

## 📱 API Reference

### **Core Endpoints**

#### **Authentication**
```typescript
// Authenticate with Supabase
POST /api/auth
{
  "email": "string",
  "password": "string"
}
```

#### **File Operations**
```typescript
// List files in a connection
GET /api/files?connectionId={id}&params={searchParams}

// Index a file
POST /api/files/index
{
  "resourceId": "string",
  "options": {
    "ocr": boolean,
    "unstructured": boolean,
    "embeddingModel": "string"
  }
}

// Remove file from listing
DELETE /api/files/{resourceId}
```

#### **Knowledge Base Operations**
```typescript
// Create knowledge base
POST /api/knowledge-bases
{
  "connection_id": "string",
  "connection_source_ids": ["string"],
  "indexing_params": {...}
}

// Trigger sync
GET /api/knowledge-bases/sync/trigger/{kb_id}/{org_id}

// Check status
GET /api/knowledge-bases/{kb_id}/resources/children
```

### **Error Handling**
```typescript
interface ApiError {
  message: string;
  status: number;
  details?: Record<string, any>;
}

// Standard error responses
400: Bad Request
401: Unauthorized
403: Forbidden
404: Not Found
422: Validation Error
500: Internal Server Error
```

## 🎨 UI Components

### **Component Library**

#### **Core Components**
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Table**: Sortable, filterable data tables
- **Input**: Search inputs with validation
- **Badge**: Status indicators with color coding
- **Dialog**: Modal dialogs for confirmations
- **Switch**: Toggle switches for settings
- **Card**: Container components for content
- **Alert**: Notification and alert components

#### **Custom Components**
- **FileTypeIcon**: File type detection and icon display
- **FileActions**: Context-aware action buttons
- **DynamicFooter**: Smart selection footer
- **FileSearchBar**: Advanced search and filtering interface
- **FileGridView**: Grid layout for file display
- **FileListView**: List layout for file display
- **BreadcrumbNav**: Navigation breadcrumbs
- **ProviderDock**: Cloud provider selection interface

### **Design System**

#### **Color Palette**
```css
/* Primary Colors */
--primary: #18181B;        /* Dark charcoal */
--primary-foreground: #FFFFFF;

/* Neutral Colors */
--neutral-50: #FAFAFA;
--neutral-100: #F5F5F5;
--neutral-200: #E5E5E5;
--neutral-800: #262626;
--neutral-900: #171717;

/* Status Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

#### **Typography Scale**
```css
/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
```

#### **Spacing System**
```css
/* Spacing Scale */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
```

## 🧪 Testing

### **Testing Strategy**
- **Unit Tests**: Component and hook testing with Jest
- **Integration Tests**: API endpoint testing
- **Component Tests**: UI component behavior testing

### **Running Tests**
```bash
# Unit tests
npm run test

# Test coverage
npm run test:coverage
```

### **Test Examples**
```typescript
// Hook test
describe('useFileExplorer', () => {
  it('manages file selection state', () => {
    const { result } = renderHook(() => useFileExplorer());
    act(() => result.current.toggleFileSelection('file1'));
    expect(result.current.selectedFiles.has('file1')).toBe(true);
  });
});
```

## 🚀 Deployment

### **Vercel Deployment (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# Deploy to production
vercel --prod
```

### **Environment Variables for Production**
```bash
# Required for production
NEXT_PUBLIC_STACK_AI_API_URL=https://api.stack-ai.com
NEXT_PUBLIC_SUPABASE_AUTH_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
STACK_AI_API_KEY=your_production_api_key
STACK_AI_ORG_ID=your_production_org_id

# Optional optimizations
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### **Build Optimization**
```bash
# Production build
npm run build

# Start production server
npm start
```

## 🤝 Contributing

### **Getting Started**
1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
4. **Make** your changes
5. **Test** thoroughly
6. **Submit** a pull request

### **Development Guidelines**
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Use conventional commit messages
- Ensure all checks pass

### **Code Review Process**
1. **Automated Checks**: CI/CD pipeline validation
2. **Peer Review**: Team member code review
3. **Testing**: Manual and automated testing
4. **Documentation**: Update relevant docs
5. **Merge**: Approved changes merged to main

### **Issue Reporting**
- Use the issue template
- Provide detailed reproduction steps
- Include system information
- Add screenshots if applicable
- Tag issues appropriately

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ by Nishant</p>
</div>
