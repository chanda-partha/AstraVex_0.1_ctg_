# NASA Mission Explorer — Standalone Production Package

This directory contains the compiled, minified, and optimized distribution of NASA Mission Explorer.

## How to Deploy

1. **Upload Contents**:
   Upload all files and directories in this folder directly to the root of your hosting provider:
   - **Netlify**: Drag & drop this folder into [Netlify Drop](https://app.netlify.com/drop).
   - **Vercel**: Deploy directly (`vercel deploy`). Preconfigured `vercel.json` included.
   - **Cloudflare Pages / AWS S3 / GitHub Pages**: Upload this folder. `_redirects` and `404.html` provide automatic SPA routing fallback.
   - **Nginx / VPS**: Copy contents to `/var/www/html`. Preconfigured `nginx.conf` included.

2. **No Build Step Required**:
   All JavaScript, CSS, 3D GLB models, Draco decoders, sounds, and video archives are already pre-bundled and optimized.
