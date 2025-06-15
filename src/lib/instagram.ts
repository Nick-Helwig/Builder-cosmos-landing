<<<<<<< HEAD
// RapidAPI Instagram integration for @booknow.hair
// This file handles fetching Instagram posts using Instagram Looter API
=======
// RapidAPI Instagram integration
// This file handles fetching Instagram posts from @booknow.hair using RapidAPI
>>>>>>> 0a6d5a9077400f88ea642ed7243998719164b1fc

interface InstagramPost {
  id: string;
  image_url: string;
  media_type: string;
  caption?: string;
  permalink: string;
  timestamp?: string;
}

<<<<<<< HEAD
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
=======
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
>>>>>>> 0a6d5a9077400f88ea642ed7243998719164b1fc
  };
}

const RAPIDAPI_KEY =
  import.meta.env.VITE_RAPIDAPI_KEY ||
  "4dd843cf7emsh2f863ef92f39024p13fe73jsn2bd67e697dcc";
<<<<<<< HEAD
const INSTAGRAM_USER_ID = "69993321572"; // booknow.hair user ID
=======
const RAPIDAPI_HOST = "instagram120.p.rapidapi.com";
>>>>>>> 0a6d5a9077400f88ea642ed7243998719164b1fc

export async function fetchInstagramPosts(
  limit: number = 6,
  username: string = "booknow.hair",
): Promise<InstagramPost[]> {
  try {
<<<<<<< HEAD
    console.log("Fetching Instagram posts for @booknow.hair...");

    // Use proxy endpoint to avoid CORS issues
    const url = `/api/instagram/user-feeds2?id=${INSTAGRAM_USER_ID}&count=${limit}`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    console.log("Making request to:", url);
    const response = await fetch(url, options);

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(
        `RapidAPI Instagram error: ${response.status} - ${errorText}`,
      );
    }

    const result = await response.text();
    console.log("Raw API response:", result.substring(0, 200) + "...");

    let data: RapidAPIResponse;
    try {
      data = JSON.parse(result);
      console.log("Parsed API response structure:", {
        hasData: !!data.data,
        hasUser: !!data.data?.user,
        hasTimeline: !!data.data?.user?.edge_owner_to_timeline_media,
        edgesCount:
          data.data?.user?.edge_owner_to_timeline_media?.edges?.length || 0,
      });
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw response:", result);
      throw new Error("Invalid JSON response from Instagram API");
    }

    // Transform RapidAPI response to our format
    const posts = data.data?.user?.edge_owner_to_timeline_media?.edges || [];
    console.log("Found", posts.length, "posts from API");

    if (posts.length === 0) {
      console.warn("No posts found in API response - check data structure");
      console.log("Full response data:", data);
      return [];
    }

    const transformedPosts = posts
      .filter((post) => {
        const isVideo = post.node.is_video;
        console.log(`Post ${post.node.id}: is_video = ${isVideo}`);
        return !isVideo; // Only include images
      })
      .map((post, index): InstagramPost => {
        const node = post.node;
        const caption =
          node.edge_media_to_caption?.edges?.[0]?.node?.text || "";

        console.log(`Transforming post ${index + 1}:`, {
          id: node.id,
          shortcode: node.shortcode,
          hasDisplayUrl: !!node.display_url,
          displayUrl: node.display_url,
          captionLength: caption.length,
          timestamp: node.taken_at_timestamp,
        });

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

    console.log(
      "Successfully transformed",
      transformedPosts.length,
      "image posts",
    );
    console.log("Sample transformed post:", transformedPosts[0]);
=======
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

>>>>>>> 0a6d5a9077400f88ea642ed7243998719164b1fc
    return transformedPosts;
  } catch (error) {
    console.error("Error fetching Instagram posts from RapidAPI:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return [];
  }
}

// Fallback method for testing
export async function fetchInstagramPostsByUsername(
  username: string = "booknow.hair",
): Promise<InstagramPost[]> {
  return fetchInstagramPosts(6, username);
}
