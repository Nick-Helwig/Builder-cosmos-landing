const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");

class InstagramCache {
  constructor() {
    this.cacheDir = path.join(__dirname, "../cache");
    this.imagesDir = path.join(this.cacheDir, "images");
    this.metadataFile = path.join(this.cacheDir, "metadata.json");
    this.fallbackImagesDir = path.join(__dirname, "../fallback-images");

    // API configuration
    this.rapidApiKey =
      process.env.RAPIDAPI_KEY ||
      "4dd843cf7emsh2f863ef92f39024p13fe73jsn2bd67e697dcc";
    this.instagramUserId = "69993321572"; // booknow.hair user ID
    this.cacheExpiry = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  }

  async initializeCache() {
    try {
      // Create cache directories
      await fs.ensureDir(this.cacheDir);
      await fs.ensureDir(this.imagesDir);
      await fs.ensureDir(this.fallbackImagesDir);

      // Check if cache exists and is valid
      const isCacheValid = await this.isCacheValid();

      if (!isCacheValid) {
        console.log("Cache is invalid or expired, updating...");
        await this.updateCache();
      } else {
        console.log("Using existing valid cache");
      }
    } catch (error) {
      console.error("Error initializing cache:", error);
      throw error;
    }
  }

  async isCacheValid() {
    try {
      const metadataExists = await fs.pathExists(this.metadataFile);
      if (!metadataExists) return false;

      const metadata = await fs.readJson(this.metadataFile);
      const now = Date.now();
      const isValid = now - metadata.timestamp < this.cacheExpiry;

      if (!isValid) {
        console.log(
          `Cache expired: ${Math.round((now - metadata.timestamp) / (60 * 60 * 1000))} hours old`,
        );
      }

      return isValid && metadata.posts && metadata.posts.length > 0;
    } catch (error) {
      console.error("Error checking cache validity:", error);
      return false;
    }
  }

  async fetchInstagramPosts() {
    try {
      const url = `https://instagram-looter2.p.rapidapi.com/user-feeds2?id=${this.instagramUserId}&count=12`;
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key": this.rapidApiKey,
          "x-rapidapi-host": "instagram-looter2.p.rapidapi.com",
        },
        timeout: 30000, // 30 second timeout
      };

      console.log("Fetching Instagram posts from API...");
      const response = await axios(url, options);

      if (!response.data || !response.data.data) {
        throw new Error("Invalid API response structure");
      }

      const posts =
        response.data.data.user?.edge_owner_to_timeline_media?.edges || [];

      if (posts.length === 0) {
        throw new Error("No posts found in API response");
      }

      // Filter and transform posts
      const transformedPosts = posts
        .filter((post) => !post.node.is_video) // Only images
        .slice(0, 6) // Limit to 6 posts
        .map((post, index) => {
          const node = post.node;
          return {
            id: node.id,
            shortcode: node.shortcode,
            display_url: node.display_url,
            caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || "",
            permalink: `https://instagram.com/p/${node.shortcode}/`,
            timestamp: node.taken_at_timestamp,
            filename: `${node.shortcode}.jpg`,
          };
        });

      console.log(
        `Successfully fetched ${transformedPosts.length} Instagram posts`,
      );
      return transformedPosts;
    } catch (error) {
      console.error("Error fetching Instagram posts:", error);
      throw error;
    }
  }

  async downloadAndOptimizeImage(url, filename) {
    try {
      console.log(`Downloading image: ${filename}`);

      const response = await axios({
        method: "GET",
        url: url,
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      const imagePath = path.join(this.imagesDir, filename);

      // Optimize image with Sharp
      await sharp(response.data)
        .resize(400, 400, {
          fit: "cover",
          position: "center",
        })
        .jpeg({
          quality: 85,
          progressive: true,
        })
        .toFile(imagePath);

      console.log(`Image optimized and saved: ${filename}`);
      return true;
    } catch (error) {
      console.error(`Error downloading image ${filename}:`, error.message);
      return false;
    }
  }

  async updateCache() {
    try {
      console.log("Starting cache update...");

      let posts = [];
      let apiSuccess = false;

      // Try to fetch from Instagram API
      try {
        posts = await this.fetchInstagramPosts();
        apiSuccess = true;
      } catch (error) {
        console.warn(
          "API fetch failed, will use fallback images:",
          error.message,
        );
      }

      // If API failed, use fallback images
      if (!apiSuccess || posts.length === 0) {
        console.log("Using fallback images...");
        posts = await this.createFallbackPosts();
      }

      // Download and optimize images
      const downloadPromises = posts.map(async (post) => {
        if (apiSuccess) {
          const success = await this.downloadAndOptimizeImage(
            post.display_url,
            post.filename,
          );
          return { ...post, downloaded: success };
        } else {
          // For fallback, just copy existing files
          return { ...post, downloaded: true };
        }
      });

      const processedPosts = await Promise.all(downloadPromises);
      const successfulPosts = processedPosts.filter((post) => post.downloaded);

      if (successfulPosts.length === 0) {
        throw new Error("No images were successfully processed");
      }

      // Update metadata
      const metadata = {
        timestamp: Date.now(),
        posts: successfulPosts.map((post) => ({
          id: post.id,
          shortcode: post.shortcode,
          caption: post.caption,
          permalink: post.permalink,
          timestamp: post.timestamp,
          filename: post.filename,
          imageUrl: `/api/instagram/images/${post.filename}`,
        })),
        source: apiSuccess ? "api" : "fallback",
        count: successfulPosts.length,
      };

      await fs.writeJson(this.metadataFile, metadata, { spaces: 2 });

      console.log(
        `Cache updated successfully with ${successfulPosts.length} images (source: ${metadata.source})`,
      );
      return metadata;
    } catch (error) {
      console.error("Error updating cache:", error);
      throw error;
    }
  }

  async createFallbackPosts() {
    // Create fallback posts with placeholder data
    const fallbackPosts = [];

    for (let i = 1; i <= 6; i++) {
      const shortcode = `fallback${i}`;
      fallbackPosts.push({
        id: `fallback_${i}`,
        shortcode: shortcode,
        display_url: "", // No URL needed for fallback
        caption: `Professional barbering service - Style ${i}`,
        permalink: "https://instagram.com/booknow.hair/",
        timestamp: Date.now() / 1000,
        filename: `${shortcode}.jpg`,
      });
    }

    // Copy fallback images to cache directory
    try {
      for (const post of fallbackPosts) {
        const sourcePath = path.join(
          __dirname,
          `../public/fallback-images/${post.filename}`,
        );
        const targetPath = path.join(this.imagesDir, post.filename);

        if (await fs.pathExists(sourcePath)) {
          await fs.copy(sourcePath, targetPath);
        } else {
          // If a specific fallback image is missing, create a placeholder
          await this.createPlaceholderImage(targetPath, post.id);
        }
      }
    } catch (error) {
      console.error("Error setting up fallback images:", error);
    }

    return fallbackPosts;
  }

  async createPlaceholderImage(imagePath, id) {
    try {
      // Create a simple colored placeholder
      const colors = [
        "#8B4513",
        "#DEB887",
        "#D2691E",
        "#CD853F",
        "#F4A460",
        "#BC8F8F",
      ];
      const colorIndex = parseInt(id.slice(-1)) || 0;
      const color = colors[colorIndex % colors.length];

      await sharp({
        create: {
          width: 400,
          height: 400,
          channels: 3,
          background: color,
        },
      })
        .jpeg({ quality: 85 })
        .toFile(imagePath);
    } catch (error) {
      console.error("Error creating placeholder image:", error);
    }
  }

  async getCachedPosts(limit = 6) {
    try {
      const metadataExists = await fs.pathExists(this.metadataFile);

      if (!metadataExists) {
        console.log("No cached metadata found, initializing...");
        await this.updateCache();
      }

      const metadata = await fs.readJson(this.metadataFile);
      const posts = metadata.posts.slice(0, limit);

      // Verify image files exist
      const verifiedPosts = [];
      for (const post of posts) {
        const imagePath = path.join(this.imagesDir, post.filename);
        const exists = await fs.pathExists(imagePath);

        if (exists) {
          verifiedPosts.push({
            ...post,
            imageUrl: `/api/instagram/images/${post.filename}`,
            alt: post.caption
              ? post.caption.substring(0, 100) + "..."
              : "Instagram post from @booknow.hair",
          });
        }
      }

      return verifiedPosts;
    } catch (error) {
      console.error("Error getting cached posts:", error);
      return [];
    }
  }
}

module.exports = new InstagramCache();
