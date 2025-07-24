// Server-side Instagram integration for reduced API costs
// This connects to the Node.js backend that handles caching

interface InstagramPost {
  id: string;
  imageUrl: string;
  alt: string;
  permalink: string;
  caption?: string;
  timestamp?: number;
  filename?: string;
}

interface InstagramResponse {
  success: boolean;
  posts: InstagramPost[];
  cached: boolean;
  timestamp: string;
  error?: string;
}

// Configuration
const SERVER_BASE_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

// Fallback posts using external CDN URLs for production reliability
const FALLBACK_POSTS: InstagramPost[] = [
  {
    id: "fallback_1",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets%2F5a34583df6fd4e4e8f252df17a4d0333%2F5a810b6046624480a2eb30416f8952db?format=webp&width=400",
    alt: "Before and after haircut transformation",
    permalink: "https://instagram.com/booknow.hair/",
    caption: "Amazing transformation at Booknow.Hair",
  },
  {
    id: "fallback_2",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets%2F5a34583df6fd4e4e8f252df17a4d0333%2F1a742b83e9844c48a6f2b72a620ba4d4?format=webp&width=400",
    alt: "Professional fade haircut and beard trim",
    permalink: "https://instagram.com/booknow.hair/",
    caption: "Fresh fade and beard styling",
  },
  {
    id: "fallback_3",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets%2F5a34583df6fd4e4e8f252df17a4d0333%2F3136516fcc6b4161a9050523c29997e0?format=webp&width=400",
    alt: "Modern haircut with precision styling",
    permalink: "https://instagram.com/booknow.hair/",
    caption: "Precision cutting and styling",
  },
  {
    id: "fallback_4",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets%2F5a34583df6fd4e4e8f252df17a4d0333%2Fe8f0e21303384544ab3a1f34b47fb324?format=webp&width=400",
    alt: "Before and after professional haircut",
    permalink: "https://instagram.com/booknow.hair/",
    caption: "Expert hair transformation",
  },
  {
    id: "fallback_5",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets%2F5a34583df6fd4e4e8f252df17a4d0333%2F06c0ddf6ac454c57866ef7de961a1106?format=webp&width=400",
    alt: "Clean fade with beard grooming",
    permalink: "https://instagram.com/booknow.hair/",
    caption: "Perfect fade and beard combination",
  },
  {
    id: "fallback_6",
    imageUrl: "https://cdn.builder.io/api/v1/image/assets%2F5a34583df6fd4e4e8f252df17a4d0333%2Ff9e082277de34ee097b6c08f32308699?format=webp&width=400",
    alt: "Premium haircut and styling service",
    permalink: "https://instagram.com/booknow.hair/",
    caption: "Premium barbering at its finest",
  },
];

/**
 * Fetch Instagram posts from server-side cache
 */
export async function fetchInstagramPosts(
  limit: number = 6,
): Promise<InstagramPost[]> {
  try {
    console.log(`Fetching ${limit} Instagram posts from server cache...`);

    const response = await fetch(
      `${SERVER_BASE_URL}/api/instagram/posts?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      },
    );

    if (!response.ok) {
      throw new Error(
        `Server responded with ${response.status}: ${response.statusText}`,
      );
    }

    const data: InstagramResponse = await response.json();

    if (!data.success || !data.posts || data.posts.length === 0) {
      throw new Error("No posts returned from server");
    }

    console.log(
      `Successfully loaded ${data.posts.length} posts from server cache`,
    );
    return data.posts.slice(0, limit);
  } catch (error) {
    console.warn("Failed to fetch from server, using fallback images:", error);
    return FALLBACK_POSTS.slice(0, limit);
  }
}

/**
 * Force refresh the server cache (admin function)
 */
export async function refreshInstagramCache(): Promise<boolean> {
  try {
    console.log("Requesting server cache refresh...");

    const response = await fetch(`${SERVER_BASE_URL}/api/instagram/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout for refresh
    });

    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Server cache refreshed successfully");
    return data.success;
  } catch (error) {
    console.error("Failed to refresh server cache:", error);
    return false;
  }
}

/**
 * Check server health and cache status
 */
export async function checkServerHealth(): Promise<{
  healthy: boolean;
  timestamp?: string;
  uptime?: number;
}> {
  // Skip server check if no server URL is configured for production
  if (!import.meta.env.VITE_SERVER_URL && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    console.log("No server configured for production, using fallback images");
    return { healthy: false };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(`${SERVER_BASE_URL}/api/health`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { healthy: false };
    }

    const data = await response.json();
    return {
      healthy: true,
      timestamp: data.timestamp,
      uptime: data.uptime,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn("Server health check timed out");
    } else {
      console.warn("Server health check failed:", error);
    }
    return { healthy: false };
  }
}
