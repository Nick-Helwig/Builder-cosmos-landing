const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs-extra");
const cron = require("node-cron");
const instagramCache = require("./services/instagram-cache");
const calendarRoutes = require("./routes/calendar");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Serve cached Instagram images
app.use(
  "/api/instagram/images",
  express.static(path.join(__dirname, "cache/images")),
);

// Serve fallback images
app.use(
  "/fallback-images",
  express.static(path.join(__dirname, "public/fallback-images")),
);

// Calendar API routes
app.use("/api/calendar", calendarRoutes);

// API Routes
app.get("/api/instagram/posts", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const posts = await instagramCache.getCachedPosts(limit);

    res.json({
      success: true,
      posts,
      cached: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching Instagram posts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch Instagram posts",
      posts: [],
    });
  }
});

// Force refresh cache (for manual updates)
app.post("/api/instagram/refresh", async (req, res) => {
  try {
    console.log("Manual cache refresh requested");
    await instagramCache.updateCache();
    const posts = await instagramCache.getCachedPosts(6);

    res.json({
      success: true,
      message: "Cache refreshed successfully",
      posts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error refreshing cache:", error);
    res.status(500).json({
      success: false,
      error: "Failed to refresh cache",
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Schedule automatic cache updates every 6 hours
cron.schedule("0 */6 * * *", async () => {
  console.log("Running scheduled Instagram cache update...");
  try {
    await instagramCache.updateCache();
    console.log("Scheduled cache update completed successfully");
  } catch (error) {
    console.error("Scheduled cache update failed:", error);
  }
});

// Initialize cache on startup
(async () => {
  try {
    console.log("Initializing Instagram cache...");
    await instagramCache.initializeCache();
    console.log("Instagram cache initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Instagram cache:", error);
  }
})();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Instagram API endpoint: http://localhost:${PORT}/api/instagram/posts`,
  );
  console.log(
    `Cache refresh endpoint: http://localhost:${PORT}/api/instagram/refresh`,
  );
});
