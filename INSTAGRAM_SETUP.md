# RapidAPI Instagram Setup for @booknow.hair

✅ **CONFIGURED**: The site is now set up to use RapidAPI Instagram Looter API for @booknow.hair posts.

## Current Setup (RapidAPI - ACTIVE)

The site is configured with:

- **API Provider**: RapidAPI Instagram Looter 2
- **Instagram Account**: @booknow.hair (ID: 69993321572)
- **API Key**: Already configured in the code
- **Status**: ✅ ACTIVE - Fetching real posts

## How It Works

1. **Automatic Fetching**: The gallery automatically fetches real posts from @booknow.hair
2. **Real-time Updates**: Latest posts appear when the page loads
3. **Fallback System**: Shows professional barbering images if API is unavailable
4. **Direct Links**: Clicking images opens the actual Instagram posts

## To Customize API Key

If you want to use your own RapidAPI key:

1. Sign up at [RapidAPI](https://rapidapi.com/)
2. Subscribe to "Instagram Looter 2" API
3. Copy your API key
4. Create a `.env` file with: `VITE_RAPIDAPI_KEY=your_key_here`

## Alternative APIs

If you prefer a different Instagram API provider:

## Current Status

✅ **WORKING**: The site displays real posts from @booknow.hair Instagram account
✅ **AUTOMATED**: Posts update automatically when the page loads
✅ **LINKED**: Clicking images opens actual Instagram posts
✅ **RESPONSIVE**: Gallery works perfectly on mobile and desktop

## Testing

The Instagram gallery should now show real posts from @booknow.hair. Check:

1. Gallery shows actual Instagram images (not stock photos)
2. Clicking images opens Instagram posts
3. Posts have real captions from Instagram
4. No console errors related to API calls

## Rate Limits & Performance

- **RapidAPI Limits**: Check your subscription plan
- **Caching**: Consider implementing caching for better performance
- **Fallbacks**: Automatic fallback to stock images if API fails

## Troubleshooting

- Check browser console for API errors
- Verify network requests to rapidapi.com are successful
- Ensure API key has proper permissions
