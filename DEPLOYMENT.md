# HDS Kitchen Visualizer - Deployment Guide

## Quick Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from kitchen-visualizer directory)
cd kitchen-visualizer
vercel --prod
```

### Option 2: Vercel Dashboard

1. Push code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Vercel auto-detects Vite configuration
6. Click "Deploy"

### Option 3: Drag & Drop

1. Run `npm run build` locally
2. Go to [vercel.com/new](https://vercel.com/new)
3. Drag the `dist` folder to the deployment zone

## Environment Variables

No environment variables required for basic functionality.

## Custom Domain

After deployment:

1. Go to your project in Vercel Dashboard
2. Settings → Domains
3. Add your custom domain (e.g., `visualizer.hdsgroup.co.za`)
4. Update DNS records as instructed

## Embedding on Your Website

### iframe Embed

```html
<iframe 
  src="https://your-deployment.vercel.app" 
  width="100%" 
  height="800px" 
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>
```

### React Component Embed

If your website uses React:

```jsx
import { useState } from 'react'

function KitchenVisualizerEmbed() {
  return (
    <div style={{ width: '100%', height: '800px' }}>
      <iframe 
        src="https://your-deployment.vercel.app" 
        width="100%" 
        height="100%" 
        frameBorder="0"
        title="HDS Kitchen Visualizer"
      />
    </div>
  )
}
```

## WhatsApp Integration

### Share Link Message

Send customers a WhatsApp message with:

```
🎨 See your kitchen in 3D!

Visualize our board colors on a virtual kitchen:
https://your-deployment.vercel.app

Tap the link to open the 3D visualizer and find your perfect color!
```

### Deep Linking (Future Enhancement)

Add URL parameters to pre-select colors:

```
https://your-deployment.vercel.app?color=lancaster-oak
```

## Performance Optimization

The build is already optimized with:

- Code splitting (React, Three.js separate chunks)
- Tree shaking
- Minification
- Gzip compression

For further optimization:

1. **Image Optimization**: Board color images are loaded from Supabase CDN
2. **Lazy Loading**: Images load as needed
3. **Caching**: Static assets cached by Vercel CDN

## Monitoring

Vercel provides built-in analytics:

- Page views
- Unique visitors
- Top pages
- Device types

Enable in Vercel Dashboard → Analytics

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 3D Scene Not Loading

- Check browser console for WebGL errors
- Ensure browser supports WebGL (all modern browsers do)
- Try Chrome/Edge for best compatibility

### Images Not Loading

- Verify Supabase storage URLs are publicly accessible
- Check CORS settings on Supabase bucket
- Ensure image URLs use HTTPS

## Support

For issues or questions:
- Email: support@hdsgroup.co.za
- Phone: [Your support number]

---

**Last Updated**: January 2025
