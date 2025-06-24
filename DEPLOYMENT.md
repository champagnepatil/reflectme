# 🚀 ReflectMe - Netlify Deployment Guide

## Quick Deploy Options

### Option 1: Netlify CLI (Recommended)

```bash
# 1. Install Netlify CLI globally
npm install -g netlify-cli

# 2. Login to your Netlify account
netlify login

# 3. Deploy directly from this folder
netlify deploy --prod --dir=dist

# 4. Follow the prompts to create a new site or deploy to existing
```

### Option 2: Git Integration

1. **Push to GitHub**: Upload this repository to GitHub
2. **Netlify Dashboard**: Go to [netlify.com](https://netlify.com) and sign in
3. **New Site**: Click "New site from Git"
4. **Connect GitHub**: Authorize and select this repository
5. **Auto Deploy**: Netlify will detect `netlify.toml` and deploy automatically

### Option 3: Drag & Drop

1. **Netlify Dashboard**: Go to [netlify.com](https://netlify.com)
2. **Drag Folder**: Drag the `dist/` folder directly onto the deployment area
3. **Upload**: Netlify will process and deploy the site

## Environment Variables

After deployment, add these environment variables in Netlify dashboard:

**Site Settings > Environment Variables**

```env
# Required for AI features
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional - for production database
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Post-Deployment Testing

Once deployed, test these key routes:

- `/` - Homepage with login options
- `/client` - Client dashboard (demo data loaded)
- `/therapist` - Therapist portal (demo patients)
- `/client/journal` - AI-powered journal with clustering
- `/client/insights` - Analytics with AI insights
- `/client/chat` - AI companion chat
- `/client/plan` - Treatment plan management

## Features Included

✅ **Demo Data**: 20+ journal entries, 3 demo patients, chat history  
✅ **AI Integration**: Gemini AI for insights, clustering, chat  
✅ **Google Fit CTA**: Health integration callout in dashboard  
✅ **SPA Routing**: Proper client-side routing configuration  
✅ **Responsive Design**: Works on desktop and mobile  
✅ **Performance Optimized**: ~950KB gzipped bundle  

## Build Information

- **Build Time**: ~45 seconds
- **Bundle Size**: 3.1MB (954KB gzipped)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion

## Need Help?

Run the deployment checker:
```bash
node deploy.cjs
```

Or check the full documentation in `README.md`.

**Happy deploying! 🎉** 