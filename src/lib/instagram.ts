// RapidAPI Instagram integration for @booknow.hair
// This file handles fetching Instagram posts using Instagram Looter API

interface InstagramPost {
  id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  permalink: string;
  timestamp: string;
}

interface RapidAPIPost {
  id: string;
  display_url: string;
  shortcode: string;
  edge_media_to_caption: {
    edges: Array<{
      node: {
        text: string;
      };
    }>;
  };
  taken_at_timestamp: number;
  is_video: boolean;
}

interface RapidAPIResponse {
  data: {
    user: {
      edge_owner_to_timeline_media: {
        edges: Array<{
          node: RapidAPIPost;
        }>;
      };
    };
  };
}

const RAPIDAPI_KEY =
  import.meta.env.VITE_RAPIDAPI_KEY ||
  "4dd843cf7emsh2f863ef92f39024p13fe73jsn2bd67e697dcc";
const INSTAGRAM_USER_ID = "69993321572"; // booknow.hair user ID

export async function fetchInstagramPosts(
  limit: number = 6,
): Promise<InstagramPost[]> {
  try {
    // Use proxy endpoint to avoid CORS issues
    const url = `/api/instagram/user-feeds2?id=${INSTAGRAM_USER_ID}&count=${limit}`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`RapidAPI Instagram error: ${response.status}`);
    }

    const result = await response.text();
    const data: RapidAPIResponse = JSON.parse(result);

    // Transform RapidAPI response to our format
    const posts = data.data?.user?.edge_owner_to_timeline_media?.edges || [];

    return posts
      .filter((post) => !post.node.is_video) // Only include images
      .map((post): InstagramPost => {
        const node = post.node;
        const caption =
          node.edge_media_to_caption?.edges?.[0]?.node?.text || "";

        return {
          id: node.id,
          media_url: node.display_url,
          media_type: "IMAGE",
          caption: caption,
          permalink: `https://instagram.com/p/${node.shortcode}/`,
          timestamp: new Date(node.taken_at_timestamp * 1000).toISOString(),
        };
      })
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching Instagram posts from RapidAPI:", error);
    return [];
  }
}

// Alternative method using Instagram username (requires different API setup)
export async function fetchInstagramPostsByUsername(
  username: string = "booknow.hair",
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
