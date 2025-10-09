# sahay-web-new

<!-- node_modules not install use -->
<!-- step:1 -->

npm install --legacy-peer-deps

<!-- step:2 -->

npm install react-colorful --legacy-peer-deps

<!-- any package install use --legacy-peer-deps -->

### 11. Content Security Policy

**Issue:** Missing security headers
**File to modify:** `vite.config.ts`

```typescript
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    }
  }
});

Development

server: {
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data:;
        font-src 'self';
        connect-src 'self' ws:;
      `.replace(/\s{2,}/g, ' ') // clean up whitespace
    }
  }


  production

 server: {
    headers: {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self';
    style-src 'self';
    img-src 'self' data:;
    font-src 'self';
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ')
 }
  }
```
