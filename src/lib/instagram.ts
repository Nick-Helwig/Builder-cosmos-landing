// Instagram Basic Display API integration
// This file handles fetching Instagram posts from @college_of_hair_design

interface InstagramPost {
  id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  permalink: string;
  timestamp: string;
}

interface InstagramResponse {
  data: InstagramPost[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

const INSTAGRAM_ACCESS_TOKEN = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_USER_ID = import.meta.env.VITE_INSTAGRAM_USER_ID;

export async function fetchInstagramPosts(
  limit: number = 6,
): Promise<InstagramPost[]> {
  if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_USER_ID) {
    console.warn(
      "Instagram API credentials not configured. Using fallback images.",
    );
    return [];
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/${INSTAGRAM_USER_ID}/media?fields=id,media_url,media_type,caption,permalink,timestamp&limit=${limit}&access_token=${INSTAGRAM_ACCESS_TOKEN}`,
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    const data: InstagramResponse = await response.json();

    // Filter to only include image posts (no videos for now)
    return data.data.filter((post) => post.media_type === "IMAGE");
  } catch (error) {
    console.error("Error fetching Instagram posts:", error);
    return [];
  }
}

// Alternative method using Instagram username (requires different API setup)
export async function fetchInstagramPostsByUsername(
  username: string = "college_of_hair_design",
): Promise<InstagramPost[]> {
  try {
    // This would require a backend service to scrape Instagram
    // or use a third-party service like InstantAPI or similar
    const response = await fetch(`/api/instagram/${username}`);

    if (!response.ok) {
      throw new Error(`Instagram fetch error: ${response.status}`);
    }

    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error("Error fetching Instagram posts by username:", error);
    return [];
  }
}
