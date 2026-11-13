# NASA Mission Explorer — Production Deployment Guide

This guide describes how to deploy NASA Mission Explorer to any hosting provider.

---

## 1. Hosting Models Overview

NASA Mission Explorer supports two production deployment models:

### Model A: Pure Static Frontend SPA (Recommended for simplicity & zero server cost)
- **Target Providers**: Vercel, Netlify, Cloudflare Pages, GitHub Pages, AWS S3 / CloudFront, Firebase Hosting.
- **Upload Target**: The `production/` folder.
- **Runtime**: Static HTML/CSS/JS. No Node.js runtime required on the server.
- **Backend API**: The app automatically uses its verified client fallbacks for NASA Open Data and AI dossiers if the Express API is not hosted alongside it.

### Model B: Unified Fullstack Node Service (Recommended for live Gemini AI generation)
- **Target Providers**: Render, Railway, Fly.io, Heroku, AWS Elastic Beanstalk, Docker container.
- **Upload Target**: Full repository or `server/` with `client/dist`.
- **Command**: `npm start` (Runs Express on port 5000 / `$PORT`, serving both API and static frontend).

---

## 2. Model A: Deploying Static Package (`production/`)

The `production/` directory is 100% self-contained and ready to upload. It includes all pre-configured routing fallbacks for every major static host:

### Option 1: Netlify
1. Drag and drop the `production/` folder into Netlify Drop (app.netlify.com/drop).
2. Or in Git repository mode:
   - **Publish directory**: `production` or `client/dist`
   - Netlify automatically detects `_redirects` for client-side SPA routing.

### Option 2: Vercel
1. Run `npx vercel deploy production` or link the repository.
2. Vercel automatically reads `production/vercel.json` for URL rewriting to `index.html`.

### Option 3: GitHub Pages
1. Deploy contents of `production/` to `gh-pages` branch.
2. `production/404.html` is pre-configured to redirect deep routes to `index.html`.

### Option 4: Nginx (VPS or Ubuntu Server)
Use the included `production/nginx.conf`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/nasa-explorer;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(glb|mp4|wav|ogg|jpg|png|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

---

## 3. Model B: Deploying Fullstack Node Service

### Environment Variables
Configure in your hosting provider's dashboard:
```env
NODE_ENV=production
PORT=5000
NASA_API_KEY=DEMO_KEY
GEMINI_API_KEY=your_gemini_api_key_here
```

### Build & Start Command
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
The server will automatically detect `client/dist` (or `production`) and serve both the API routes (`/api/*`) and the static 3D frontend (`/*`) on the single configured `$PORT`.

---

## 4. Pre-Deployment Verification Checklist

- [x] Run `npm test` -> 40/40 tests pass.
- [x] Run `npm run build` -> Clean Vite bundle with zero circular warnings.
- [x] Test production preview locally: `npm run preview`.
- [x] Verify audio assets load without 404s.
- [x] Verify 3D GLB models load without 404s.
- [x] Verify client-side route transitions and modal skeletons.
