const express = require('express');
const router = express.Router();
const googleCalendar = require('../services/google-calendar');

// Get available appointment slots
router.get('/slots', async (req, res) => {
  try {
    const serviceType = req.query.service || 'Premium Haircut';
    const daysAhead = parseInt(req.query.days) || 30;

    const slots = await googleCalendar.getAvailableSlots(serviceType, daysAhead);

    res.json({
      success: true,
      slots,
      timezone: 'America/New_York',
      count: slots.length,
    });
  } catch (error) {
    console.error('Error fetching calendar slots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available slots',
      message: error.message,
    });
  }
});

// Create new appointment
router.post('/book', async (req, res) => {
  try {
    const {
      slotId,
      startTime,
      endTime,
      serviceType,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    } = req.body;

    // Validate required fields
    if (!startTime || !endTime || !serviceType || !customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['startTime', 'endTime', 'serviceType', 'customerName', 'customerEmail'],
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    const appointmentData = {
      slotId,
      startTime,
      endTime,
      serviceType,
      customerName: customerName.trim(),
      customerEmail: customerEmail.toLowerCase().trim(),
      customerPhone: customerPhone?.trim(),
      notes: notes?.trim(),
    };

    const result = await googleCalendar.createAppointment(appointmentData);

    res.json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment: result,
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to book appointment',
      message: error.message,
    });
  }
});

// Get OAuth authorization URL (for setup)
router.get('/auth-url', (req, res) => {
  try {
    const authUrl = googleCalendar.getAuthUrl();
    res.json({
      success: true,
      authUrl,
      message: 'Visit this URL to authorize calendar access',
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate authorization URL',
    });
  }
});

// Health check for calendar API
router.get('/health', async (req, res) => {
  try {
    const initialized = await googleCalendar.initialize();
    res.json({
      success: initialized,
      message: initialized ? 'Calendar API ready' : 'Calendar API not configured',
      timezone: 'America/New_York',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Calendar API health check failed',
      message: error.message,
    });
  }
});

module.exports = router;
