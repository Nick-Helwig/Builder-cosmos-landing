// Instagram cache utility for storing posts locally to reduce API costs

interface CachedInstagramPost {
  id: string;
  image: string;
  alt: string;
  permalink: string;
}

interface InstagramCache {
  posts: CachedInstagramPost[];
  timestamp: number;
  version: string; // For cache invalidation if structure changes
}

const CACHE_KEY = "instagram_posts_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_VERSION = "1.0";

// Check if cache exists and is valid (less than 24 hours old)
export function isCacheValid(): boolean {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return false;

    const cacheData: InstagramCache = JSON.parse(cached);

    // Check version compatibility
    if (cacheData.version !== CACHE_VERSION) {
      console.log("Instagram cache version mismatch, invalidating cache");
      localStorage.removeItem(CACHE_KEY);
      return false;
    }

    const now = Date.now();
    const isValid = now - cacheData.timestamp < CACHE_DURATION;

    if (!isValid) {
      console.log("Instagram cache expired, needs refresh");
    } else {
      const hoursOld = Math.round(
        (now - cacheData.timestamp) / (60 * 60 * 1000),
      );
      console.log(`Instagram cache is ${hoursOld} hours old, still valid`);
    }

    return isValid;
  } catch (error) {
    console.error("Error checking Instagram cache validity:", error);
    localStorage.removeItem(CACHE_KEY);
    return false;
  }
}

// Get cached Instagram posts
export function getCachedPosts(): CachedInstagramPost[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData: InstagramCache = JSON.parse(cached);

    // Validate cache structure
    if (!cacheData.posts || !Array.isArray(cacheData.posts)) {
      console.error("Invalid cache structure");
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    console.log(`Loaded ${cacheData.posts.length} posts from Instagram cache`);
    return cacheData.posts;
  } catch (error) {
    console.error("Error loading Instagram cache:", error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

// Cache Instagram posts with timestamp
export function cachePosts(posts: CachedInstagramPost[]): void {
  try {
    const cacheData: InstagramCache = {
      posts,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log(`Cached ${posts.length} Instagram posts for 24 hours`);
  } catch (error) {
    console.error("Error caching Instagram posts:", error);
    // If localStorage is full or unavailable, continue without caching
  }
}

// Clear cache (useful for debugging or manual refresh)
export function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
  console.log("Instagram cache cleared");
}

// Get cache info for debugging
export function getCacheInfo(): {
  exists: boolean;
  age?: number;
  count?: number;
} {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return { exists: false };

    const cacheData: InstagramCache = JSON.parse(cached);
    const age = Date.now() - cacheData.timestamp;

    return {
      exists: true,
      age: Math.round(age / (60 * 60 * 1000)), // age in hours
      count: cacheData.posts?.length || 0,
    };
  } catch {
    return { exists: false };
  }
}
