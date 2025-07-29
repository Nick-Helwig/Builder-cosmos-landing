#!/usr/bin/env node

// Load environment variables from parent directory
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Log environment variables status once
if (!process.env.ENV_LOGGED) {
  console.log('Loading environment variables...');
  console.log('GOOGLE_CALENDAR_ID:', process.env.GOOGLE_CALENDAR_ID ? 'Set' : 'NOT SET');
  console.log('GOOGLE_SERVICE_ACCOUNT_KEY:', process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? 'Set' : 'NOT SET');
  process.env.ENV_LOGGED = 'true';
}

// Start the actual server
require('./index.js');