// RapidAPI Instagram integration
// This file handles fetching Instagram posts from @booknow.hair using RapidAPI

interface InstagramPost {
  id: string;
  image_url: string;
  media_type: string;
  caption?: string;
  permalink: string;
  timestamp?: string;
}

interface RapidAPIInstagramResponse {
  status: string;
  data: {
    posts: Array<{
      id: string;
      shortcode: string;
      display_url: string;
      edge_media_to_caption?: {
        edges: Array<{
          node: {
            text: string;
          };
        }>;
      };
      taken_at_timestamp: number;
    }>;
  };
}

const RAPIDAPI_KEY =
  import.meta.env.VITE_RAPIDAPI_KEY ||
  "4dd843cf7emsh2f863ef92f39024p13fe73jsn2bd67e697dcc";
const RAPIDAPI_HOST = "instagram120.p.rapidapi.com";

export async function fetchInstagramPosts(
  limit: number = 6,
  username: string = "booknow.hair",
): Promise<InstagramPost[]> {
  try {
    const url = "https://instagram120.p.rapidapi.com/api/instagram/posts";
    const options = {
      method: "POST",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        maxId: "",
      }),
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`RapidAPI Instagram error: ${response.status}`);
    }

    const result = await response.text();
    const data: RapidAPIInstagramResponse = JSON.parse(result);

    if (data.status !== "success" || !data.data?.posts) {
      console.warn("No Instagram posts found or API error");
      return [];
    }

    // Transform RapidAPI response to our format
    const transformedPosts: InstagramPost[] = data.data.posts
      .slice(0, limit)
      .map((post) => ({
        id: post.id,
        image_url: post.display_url,
        media_type: "IMAGE",
        caption: post.edge_media_to_caption?.edges?.[0]?.node?.text || "",
        permalink: `https://instagram.com/p/${post.shortcode}/`,
        timestamp: new Date(post.taken_at_timestamp * 1000).toISOString(),
      }));

    return transformedPosts;
  } catch (error) {
    console.error("Error fetching Instagram posts:", error);
    return [];
  }
}

// Fallback method for testing
export async function fetchInstagramPostsByUsername(
  username: string = "booknow.hair",
): Promise<InstagramPost[]> {
  return fetchInstagramPosts(6, username);
}
