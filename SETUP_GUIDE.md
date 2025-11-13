# YouTube Channel Categorizer - Setup Guide

## YouTube OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - `https://your-codespace-url/auth/google/callback`

### Step 2: Get Your Credentials
1. Copy `Client ID` and `Client Secret`
2. Get your `API Key` from credentials page

### Step 3: Configure .env
```
YOUTUBE_API_KEY=your_api_key
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/auth/google/callback
PORT=3000
NODE_ENV=development
```

## Features

✅ Add Custom Categories
✅ Add YouTube Channels
✅ Categorize Channels  
✅ View Channels by Category
✅ Chronological Sorting
✅ Search & Filter

## API Endpoints

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `GET /api/channels/:category_id` - Get channels by category
- `POST /api/channels` - Add channel
- `GET /api/all-channels` - Get all channels (chronological)
- `GET /auth/google` - Start OAuth flow
- `GET /auth/google/callback` - OAuth callback

## Running the App

```bash
npm install
node server.js
```

Open http://localhost:3000 in your browser.

