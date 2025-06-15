# Instagram API Setup for @booknow.hair - RapidAPI Integration

This guide shows the Instagram API integration using RapidAPI for displaying real posts from @booknow.hair.

## ✅ **ALREADY CONFIGURED!**

The Instagram integration is **already set up and working** with:

- **Service**: RapidAPI Instagram120 API
- **Account**: @booknow.hair
- **API Key**: Configured and ready to use

## How It Works

The website automatically fetches real Instagram posts from @booknow.hair using:

1. **RapidAPI Instagram120 API**
2. **POST request** to fetch user posts
3. **Automatic image display** in the gallery section
4. **Direct links** to original Instagram posts

## API Configuration

The integration uses these settings:

- **Endpoint**: `https://instagram120.p.rapidapi.com/api/instagram/posts`
- **Method**: POST
- **Username**: booknow.hair
- **Max Posts**: 6 (configurable)

## Environment Variables

Current configuration in `.env`:

```
VITE_RAPIDAPI_KEY=4dd843cf7emsh2f863ef92f39024p13fe73jsn2bd67e697dcc
VITE_INSTAGRAM_USERNAME=booknow.hair
```

## Features

- ✅ **Real Instagram posts** from @booknow.hair
- ✅ **Automatic loading** on page visit
- ✅ **Click to view** original Instagram post
- ✅ **Fallback images** if API is unavailable
- ✅ **Loading states** and error handling
- ✅ **Mobile responsive** gallery
- ✅ **Professional appearance**

## Fallback System

If the Instagram API is unavailable:

- Shows high-quality barbering images
- Maintains professional appearance
- Links to Instagram profile
- No broken functionality

## Rate Limits

RapidAPI Instagram120:

- Check your RapidAPI dashboard for current limits
- Consider upgrading plan for higher usage
- Automatic caching reduces API calls

## Testing

1. Visit the website gallery section
2. Should show real Instagram posts from @booknow.hair
3. Click images to view on Instagram
4. Check browser console for any errors

## Customization

To change settings:

1. Update `.env` file
2. Modify `src/lib/instagram.ts` for different limits
3. Restart development server

## Support

- **RapidAPI Dashboard**: Check usage and limits
- **Instagram Issues**: Verify @booknow.hair account is public
- **Technical Issues**: Check browser console for error messages

The integration is production-ready and automatically pulls the latest posts from @booknow.hair!
