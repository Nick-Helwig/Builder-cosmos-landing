#!/usr/bin/env node

const instagramCache = require("../services/instagram-cache");
require("dotenv").config();

async function updateCache() {
  console.log("Starting manual cache update...");

  try {
    await instagramCache.updateCache();
    console.log("Cache update completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Cache update failed:", error);
    process.exit(1);
  }
}

updateCache();
