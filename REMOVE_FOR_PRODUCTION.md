# 🚨 REMOVE FOR PRODUCTION - Mock Files & Dev Mode

## ⚠️ **CRITICAL: Remove these files before going live!**

### **1. Mock Configuration Files**
```
lib/config/development.ts          ← DELETE ENTIRE FILE
lib/api/mock-api.ts               ← DELETE ENTIRE FILE
```

### **2. Mock Imports to Remove**

#### **From `lib/api/stack-ai-client.ts`:**
```typescript
// REMOVE these lines:
import { 
  DEV_MODE, 
  MOCK_AUTH_TOKEN,    ← DELETE
  MOCK_ORG_ID         ← DELETE
} from '@/lib/config/development';

// REMOVE these lines:
if (DEV_MODE) {
  this.authHeaders = {
    Authorization: `Bearer ${MOCK_AUTH_TOKEN}`,  ← DELETE
  };
  this.orgId = MOCK_ORG_ID;                     ← DELETE
}
```

#### **From `lib/api/files.ts`:**
```typescript
// REMOVE this line:
import { mockApi } from './mock-api';            ← DELETE

// REMOVE this line:
if (DEV_MODE) {
  return mockApi.listFiles(connectionId, options);  ← DELETE
}
```

#### **From `hooks/use-files.ts`:**
```typescript
// REMOVE this line:
import { DEV_MODE } from '@/lib/config/development';  ← DELETE

// REMOVE any DEV_MODE checks in the hooks
```

### **3. Dev Mode Toggle Component**
```
components/ui/dev-mode-toggle.tsx  ← DELETE ENTIRE FILE
```

#### **From `app/layout.tsx`:**
```typescript
// REMOVE this line:
import { DevModeToggle } from "@/components/ui/dev-mode-toggle";

// REMOVE this line:
<DevModeToggle />
```

### **4. Environment Variables to Update**
Make sure your `.env.local` has the correct live credentials:
```bash
# Stack AI API Configuration
NEXT_PUBLIC_STACK_AI_API_URL=https://api.stack-ai.com
NEXT_PUBLIC_SUPABASE_AUTH_URL=https://sb.stack-ai.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_key_here

# Stack AI Live Credentials
NEXT_PUBLIC_STACK_AI_EMAIL=stackaitest@gmail.com
NEXT_PUBLIC_STACK_AI_PASSWORD=!z4ZnxkyLYs#vR
```

### **5. Quick Removal Commands**
```bash
# Remove mock files
rm lib/config/development.ts
rm lib/api/mock-api.ts
rm components/ui/dev-mode-toggle.tsx

# Remove from layout
# Edit app/layout.tsx manually to remove DevModeToggle

# Clean up imports in remaining files
# Edit the files mentioned above to remove mock imports
```

### **6. What Happens After Removal**
- ✅ Real API calls to Stack AI
- ✅ Real Google Drive authentication
- ✅ Real file operations
- ✅ No more mock data
- ✅ Production-ready code

### **7. Test Before Going Live**
1. Remove all mock files
2. Update environment variables
3. Test authentication flow
4. Test file operations
5. Verify no console errors
6. Deploy to production

---
**Remember: Once you remove these files, the app will use real APIs. Make sure your credentials are correct!**
