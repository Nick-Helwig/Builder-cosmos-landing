# Instagram API Setup for @booknow.hair

This guide will help you set up Instagram API integration to display real posts from @booknow.hair.

## Option 1: Instagram Basic Display API (Recommended)

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Click "Create App" → "Other" → "Consumer"
3. Fill in app details and create the app

### Step 2: Add Instagram Basic Display

1. In your app dashboard, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. Go to Instagram Basic Display → Basic Display

### Step 3: Create Instagram Test User

1. Go to Roles → Roles
2. Add Instagram Testers
3. Add the Instagram account @booknow.hair
4. The account owner needs to accept the invitation

### Step 4: Generate Access Token

1. In Instagram Basic Display settings
2. Add a new Instagram App
3. Generate User Token for the test user
4. Copy the access token

### Step 5: Get User ID

1. Make a request to: `https://graph.instagram.com/me?fields=id,username&access_token=YOUR_ACCESS_TOKEN`
2. Copy the user ID from the response

### Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Add your credentials:

```
VITE_INSTAGRAM_ACCESS_TOKEN=your_access_token_here
VITE_INSTAGRAM_USER_ID=your_user_id_here
```

## Option 2: Third-Party Service (Easier)

### Services to Consider:

- **InstantAPI** - Simple Instagram API
- **RapidAPI Instagram** - Various Instagram API providers
- **Instagram Scraper APIs** - No official API needed

### Example with InstantAPI:

1. Sign up at InstantAPI
2. Get your API key
3. Update the component to use their endpoint:

```javascript
const response = await fetch(
  `https://api.instantapi.ai/instagram/posts/@booknow.hair`,
);
```

## Option 3: Backend Instagram Scraper

### Create a Backend Endpoint:

```javascript
// api/instagram/[username].js
export default async function handler(req, res) {
  const { username } = req.query;

  try {
    // Use a scraping library like puppeteer or instagram-web-api
    const posts = await scrapeInstagramPosts(username);
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
}
```

## Current Fallback

The site currently uses high-quality barbering images as fallbacks while you set up the Instagram API. Once configured, it will automatically display real posts from @booknow.hair.

## Testing

1. After setup, the Instagram gallery should show real posts
2. Check browser console for any API errors
3. Verify posts link to actual Instagram URLs

## Rate Limits

- Instagram Basic Display: 200 requests per hour per user
- Refresh tokens every 60 days
- Consider caching responses to reduce API calls

## Security Notes

- Never commit access tokens to git
- Use environment variables for all credentials
- Consider using a backend proxy for additional security
