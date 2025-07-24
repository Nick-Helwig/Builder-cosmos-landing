#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");

const FALLBACK_IMAGES = [
  {
    url: "https://cdn.builder.io/api/v1/image/assets%2F5a34583df6fd4e4e8f252df17a4d0333%2F5a810b6046624480a2eb30416f8952db?format=webp&width=800",
    filename: "fallback_1.jpg",
    alt: "Before and after haircut transformation",
  },
  {
    url: "https://cdn.builder.io/api/v1/image/assets%2F5a34583df6fd4e4e8f252df17a4d0333%2F1a742b83e9844c48a6f2b72a620ba4d4?format=webp&width=800",
    filename: "fallback_2.jpg",
    alt: "Professional fade haircut and beard trim",
  },
  {
    url: "https://cdn.builder.io/api/v1/image/assets%2F5a34583df6fd4e4e8f252df17a4d0333%2F3136516fcc6b4161a9050523c29997e0?format=webp&width=800",
    filename: "fallback_3.jpg",
    alt: "Modern haircut with precision styling",
  },
  {
    url: "https://cdn.builder.io/api/v1/image/assets%2F5a34583df6fd4e4e8f252df17a4d0333%2Fe8f0e21303384544ab3a1f34b47fb324?format=webp&width=800",
    filename: "fallback_4.jpg",
    alt: "Before and after professional haircut",
  },
  {
    url: "https://cdn.builder.io/api/v1/image/assets%2F5a34583df6fd4e4e8f252df17a4d0333%2F06c0ddf6ac454c57866ef7de961a1106?format=webp&width=800",
    filename: "fallback_5.jpg",
    alt: "Clean fade with beard grooming",
  },
  {
    url: "https://cdn.builder.io/api/v1/image/assets%2F5a34583df6fd4e4e8f252df17a4d0333%2Ff9e082277de34ee097b6c08f32308699?format=webp&width=800",
    filename: "fallback_6.jpg",
    alt: "Premium haircut and styling service",
  },
];

async function downloadFallbackImages() {
  const fallbackDir = path.join(__dirname, "../public/fallback-images");
  
  try {
    // Ensure directory exists
    await fs.ensureDir(fallbackDir);
    console.log(`📁 Created fallback images directory: ${fallbackDir}`);

    // Download each image
    for (const image of FALLBACK_IMAGES) {
      try {
        console.log(`⬇️  Downloading: ${image.filename}`);
        
        const response = await axios({
          method: "GET",
          url: image.url,
          responseType: "arraybuffer",
          timeout: 30000,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        const imagePath = path.join(fallbackDir, image.filename);

        // Optimize and save image
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

        console.log(`✅ Saved: ${image.filename} (${image.alt})`);
      } catch (error) {
        console.error(`❌ Failed to download ${image.filename}:`, error.message);
      }
    }

    // Create metadata file
    const metadata = {
      created: new Date().toISOString(),
      images: FALLBACK_IMAGES.map((img) => ({
        filename: img.filename,
        alt: img.alt,
        path: `/fallback-images/${img.filename}`,
      })),
    };

    await fs.writeJson(path.join(fallbackDir, "metadata.json"), metadata, {
      spaces: 2,
    });

    console.log(`📋 Created metadata file`);
    console.log(`🎉 Successfully downloaded ${FALLBACK_IMAGES.length} fallback images`);
  } catch (error) {
    console.error("❌ Error downloading fallback images:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  downloadFallbackImages()
    .then(() => {
      console.log("✨ Fallback images setup complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Setup failed:", error);
      process.exit(1);
    });
}

module.exports = { downloadFallbackImages };
