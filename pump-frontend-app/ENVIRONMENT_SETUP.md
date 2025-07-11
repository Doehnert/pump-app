# Environment Setup Guide

## Overview

The Pump Master frontend uses environment variables to configure API endpoints and other settings for different environments.

## Environment Files

Create the following environment files in the `pump-frontend-app/` directory:

### `.env.development` (for local development)
```bash
VITE_API_URL=http://localhost:5073
VITE_APP_NAME=Pump Master (Dev)
VITE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
```

### `.env.production` (for production builds)
```bash
VITE_API_URL=https://api.informag.com.au
VITE_APP_NAME=Pump Master
VITE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

### `.env.staging` (for staging environment)
```bash
VITE_API_URL=https://staging-api.informag.com.au
VITE_APP_NAME=Pump Master (Staging)
VITE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5073` |
| `VITE_APP_NAME` | Application name | `Pump Master` |
| `VITE_DEBUG` | Enable debug logging | `false` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | `false` |

## Usage

The environment configuration is automatically loaded based on the current environment:

- **Development**: Uses `.env.development` or falls back to localhost
- **Production**: Uses `.env.production` or falls back to production URL
- **Test**: Uses test configuration

## API Integration

The API service automatically uses the correct base URL:

```typescript
import { config } from './config/environment';

// Access the API URL
console.log(config.apiUrl); // http://localhost:5073 (dev) or https://api.informag.com.au (prod)

// Use helper functions
import { getApiUrl, log } from './config/environment';

const apiUrl = getApiUrl('/api/pump'); // Constructs full URL
log('API call made', { endpoint: '/api/pump' }); // Debug logging
```

## Backend Integration

### Development
- Backend runs on `http://localhost:5073`
- Frontend connects to local backend
- CORS is configured for localhost

### Production
- Backend runs on Azure
- Frontend connects to production API
- HTTPS is required

### Staging
- Backend runs on staging environment
- Frontend connects to staging API
- Used for testing before production

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your backend allows requests from your frontend domain:

```csharp
// In your .NET backend Program.cs
app.UseCors(builder => builder
    .WithOrigins("http://localhost:5173", "https://your-frontend-domain.com")
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());
```

### Environment Variables Not Loading
1. Ensure environment files are in the correct location
2. Restart your development server
3. Check that variable names start with `VITE_`

### API Connection Issues
1. Verify the backend is running
2. Check the API URL in your environment file
3. Ensure the backend port matches your configuration
4. Check browser console for CORS errors

## Best Practices

1. **Never commit sensitive data** - Use environment variables for API keys, secrets
2. **Use different URLs** for different environments
3. **Test API connectivity** before deploying
4. **Monitor API responses** in production
5. **Use HTTPS** in production environments 