# Environment Setup Guide

## Required Environment Variables

This project requires several environment variables to connect to the Stack AI API. Create a `.env.local` file in the root directory with the following variables:

```bash
# Stack AI API Configuration
STACK_AI_API_URL=https://api.stack-ai.com
SUPABASE_AUTH_URL=https://sb.stack-ai.com
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stack AI Test Credentials (for development only)
STACK_AI_EMAIL=your_test_email_here
STACK_AI_PASSWORD=your_test_password_here
```

## Getting the Values

### From the Task Specification
- Test email and password for Stack AI
- Instructions on how to access the Stack AI account

### From the Jupyter Notebook
The `knowledge_base_workflow.ipynb` file contains:
- API endpoints and URLs
- Supabase configuration details

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `.env.local` files to Git
- These credentials are for development/testing only
- In production, use proper secret management
- The `.env.local` file is already in `.gitignore`

## Setup Steps

1. Copy the credentials from the task specification
2. Create `.env.local` in the project root
3. Add the environment variables with actual values
4. Restart your development server (`npm run dev`)

## Verification

Once configured, the API integration test on `/test` page should show successful authentication instead of "Not authenticated" errors.
