const express = require('express');
const path = require('path');
const cors = require('cors');
const instagramCache = require('./services/instagram-cache');
const calendarRoutes = require('./routes/calendar');

const app = express();
const PORT = process.env.PORT || 3001;

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

app.use(cors());
app.use(express.json());

// Initialize Instagram cache on startup
instagramCache.initializeCache().catch(console.error);

// Calendar routes
console.log('Setting up calendar routes...');
app.use('/api/calendar', calendarRoutes);
console.log('Calendar routes configured');

// Test calendar route directly
app.get('/api/calendar/test', (req, res) => {
  res.json({ message: 'Direct calendar test route works' });
});

// API route to get Instagram posts
app.get('/api/instagram/posts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const posts = await instagramCache.getCachedPosts(limit);
    
    res.json({
      success: true,
      posts: posts,
      count: posts.length
    });
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Instagram posts'
    });
  }
});

// Serve cached images
app.get('/api/instagram/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'cache', 'images', filename);
  
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error('Error serving image:', err);
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Instagram cache server running on port ${PORT}`);
});
