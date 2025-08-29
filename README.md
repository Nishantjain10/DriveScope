# 🚀 DriveScope - Custom Google Drive File Picker with AI Indexing

> **A modern, intelligent file management system that seamlessly integrates Google Drive with AI-powered indexing capabilities. Built with Next.js, TypeScript, and cutting-edge web technologies.**

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
- **Google Drive Integration**: Seamless OAuth2 authentication
- **Secure API Communication**: Encrypted data transmission
- **Session Management**: Persistent user sessions with automatic refresh

### 📁 **File Management**
- **Intelligent File Explorer**: Google Drive-style interface with modern UX
- **Folder Navigation**: Deep folder exploration with lazy loading
- **File Type Recognition**: Automatic icon detection for 50+ file formats
- **Bulk Operations**: Select multiple files for batch processing

### 🤖 **AI-Powered Indexing**
- **Smart Indexing**: AI-driven content analysis and categorization
- **Real-time Status**: Live updates on indexing progress
- **Batch Processing**: Efficient bulk indexing with progress tracking
- **Error Handling**: Robust error recovery and user feedback

### 🎯 **Advanced Features**
- **Search & Filter**: Powerful file search with multiple filter options
- **Sorting**: Flexible sorting by name, date, size, and status
- **Responsive Design**: Mobile-first approach with cross-device compatibility
- **Dark/Light Themes**: Customizable visual preferences

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.17 or later
- **npm** 9.0 or later
- **Google Cloud Console** account for API credentials

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
STACK_AI_API_URL=https://api.stack-ai.com
STACK_AI_API_KEY=your_stack_ai_api_key
STACK_AI_ORG_ID=your_organization_id
SUPABASE_AUTH_URL=https://sb.stack-ai.com
SUPABASE_ANON_KEY=your_supabase_anon_key
STACK_AI_EMAIL=your_test_email
STACK_AI_PASSWORD=your_test_password
```

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Linting and type checking
npm run lint
npm run type-check
```

**🌐 Open [http://localhost:3000](http://localhost:3000) in your browser**

## 🛠️ Tech Stack

### **Frontend Framework**
- **[Next.js 15.5.2](https://nextjs.org/)** - React framework with App Router
- **[React 19.1.0](https://reactjs.org/)** - Modern React with concurrent features
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Type-safe JavaScript

### **Styling & UI**
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible component library
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations and transitions

### **State Management & Data Fetching**
- **[TanStack Query 5.0](https://tanstack.com/query)** - Powerful data synchronization
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms with validation
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

### **Development Tools**
- **[ESLint](https://eslint.org/)** - Code quality and consistency
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Husky](https://typicode.github.io/husky/)** - Git hooks for quality assurance

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
│   ├── 📁 files/                    # File explorer page
│   ├── 📁 test/                     # Component testing page
│   ├── 📄 layout.tsx                # Root layout
│   ├── 📄 page.tsx                  # Homepage
│   └── 📄 globals.css               # Global styles
├── 📁 components/                   # Reusable UI components
│   ├── 📁 ui/                       # Shadcn/ui components
│   │   ├── 📄 button.tsx            # Button component
│   │   ├── 📄 table.tsx             # Table component
│   │   ├── 📄 input.tsx             # Input component
│   │   ├── 📄 badge.tsx             # Status badge component
│   │   ├── 📄 file-actions.tsx      # File action buttons
│   │   ├── 📄 file-search-bar.tsx   # Search and filter bar
│   │   ├── 📄 file-type-icon.tsx    # File type icons
│   │   ├── 📄 dynamic-footer.tsx    # Selection footer
│   │   └── 📄 file-explorer-header.tsx # Explorer header
│   └── 📄 index.ts                  # Component exports
├── 📁 hooks/                        # Custom React hooks
│   ├── 📄 use-file-explorer.ts      # Main file explorer logic
│   ├── 📄 use-files.ts              # File data management
│   └── 📄 use-connections.ts        # Connection management
├── 📁 lib/                          # Utility libraries
│   ├── 📁 api/                      # API client and functions
│   │   ├── 📄 files.ts              # File operations API
│   │   ├── 📄 knowledge-base.ts     # Knowledge base API
│   │   └── 📄 stack-ai-client.ts    # Stack AI client
│   ├── 📁 types/                    # TypeScript type definitions
│   │   └── 📄 api.ts                # API response types
│   ├── 📁 utils/                    # Utility functions
│   └── 📄 config.ts                 # Configuration constants
├── 📁 public/                       # Static assets
├── 📁 stack-ai-home-task/           # Task documentation
├── 📄 .env.example                  # Environment variables template
├── 📄 .eslintrc.json                # ESLint configuration
├── 📄 .gitignore                    # Git ignore rules
├── 📄 next.config.ts                # Next.js configuration
├── 📄 package.json                  # Dependencies and scripts
├── 📄 tailwind.config.ts            # Tailwind CSS configuration
├── 📄 tsconfig.json                 # TypeScript configuration
└── 📄 README.md                     # This file
```

## 🔧 Development

### **Code Quality Standards**

#### **TypeScript Best Practices**
- Strict type checking enabled
- No `any` types allowed
- Proper interface definitions
- Generic type usage where appropriate

#### **React Best Practices**
- Functional components with hooks
- Proper dependency arrays in useEffect
- Memoization for expensive operations
- Clean component composition

#### **CSS Architecture**
- Utility-first approach with Tailwind
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
npm run type-check

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

#### **File Operations**
```typescript
// List files in a folder
GET /api/files?folderId={id}

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
  code: string;
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

#### **Custom Components**
- **FileTypeIcon**: Intelligent file type detection
- **FileActions**: Context-aware action buttons
- **DynamicFooter**: Smart selection footer
- **FileSearchBar**: Advanced search and filtering

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
- **Unit Tests**: Component and hook testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: User workflow testing
- **Visual Regression**: UI consistency testing

### **Running Tests**
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Visual regression
npm run test:visual
```

### **Test Examples**
```typescript
// Component test
describe('FileTypeIcon', () => {
  it('renders folder icon for directories', () => {
    const file = { inode_type: 'directory' };
    render(<FileTypeIcon file={file} />);
    expect(screen.getByTestId('folder-icon')).toBeInTheDocument();
  });
});

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
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
NEXT_PUBLIC_API_BASE_URL=https://api.stack-ai.com
STACK_AI_API_KEY=your_production_api_key
STACK_AI_ORG_ID=your_production_org_id

# Optional optimizations
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### **Build Optimization**
```bash
# Analyze bundle size
npm run build:analyze

# Generate static export
npm run export

# Performance monitoring
npm run lighthouse
```

### **Monitoring & Analytics**
- **Performance**: Core Web Vitals monitoring
- **Errors**: Error tracking and reporting
- **Analytics**: User behavior insights
- **Uptime**: Service availability monitoring

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

### **License Terms**
- ✅ **Commercial Use**: Allowed
- ✅ **Modification**: Allowed
- ✅ **Distribution**: Allowed
- ✅ **Private Use**: Allowed
- ❌ **Liability**: Limited
- ❌ **Warranty**: None

---

## 🙏 Acknowledgments

- **Google Drive API** for file management capabilities
- **Stack AI** for AI-powered indexing infrastructure
- **Next.js Team** for the amazing React framework
- **Tailwind CSS** for the utility-first CSS approach
- **Shadcn/ui** for beautiful, accessible components

## 📞 Support

- **Documentation**: [docs.drivescope.dev](https://docs.drivescope.dev)
- **Issues**: [GitHub Issues](https://github.com/yourusername/drivescope/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/drivescope/discussions)
- **Email**: support@drivescope.dev

---

<div align="center">
  <p>Made with ❤️ by the DriveScope Team</p>
  <p>
    <a href="https://github.com/yourusername/drivescope/stargazers">
      <img src="https://img.shields.io/github/stars/yourusername/drivescope?style=social" alt="Stars">
    </a>
    <a href="https://github.com/yourusername/drivescope/forks">
      <img src="https://img.shields.io/github/forks/yourusername/drivescope?style=social" alt="Forks">
    </a>
    <a href="https://github.com/yourusername/drivescope/issues">
      <img src="https://img.shields.io/github/issues/yourusername/drivescope" alt="Issues">
    </a>
  </p>
</div>
