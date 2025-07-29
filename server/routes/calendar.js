const express = require('express');
const router = express.Router();
const googleCalendarService = require('../services/google-calendar');

// Health check endpoint for calendar service
router.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    service: 'calendar',
    timestamp: new Date().toISOString()
  });
});

// Get available time slots
router.get('/slots', async (req, res) => {
  try {
    const { service, days = 30 } = req.query;
    
    // Initialize Google Calendar service if not already done
    await googleCalendarService.initialize();
    
    // Get real available slots from Google Calendar
    const slots = await googleCalendarService.getAvailableSlots(service, parseInt(days));
    
    res.json({
      success: true,
      slots: slots,
      service: service
    });
  } catch (error) {
    console.error('Error fetching calendar slots:', error);
    
    // Fallback to mock data if Google Calendar fails
    const slots = [];
    const now = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      // Skip weekends for now
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Generate time slots from 9 AM to 5 PM
      for (let hour = 9; hour <= 17; hour++) {
        if (hour === 12) continue; // Skip lunch hour
        
        const startTime = new Date(date);
        startTime.setHours(hour, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(30); // 30-minute appointments
        
        slots.push({
          id: `slot_${date.getTime()}_${hour}`,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          displayTime: startTime.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'America/New_York'
          }),
          available: true
        });
      }
    }
    
    res.json({
      success: true,
      slots: slots.slice(0, 20), // Limit to 20 slots
      service: req.query.service,
      fallback: true,
      error: error.message
    });
  }
});

// Book an appointment
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
      notes
    } = req.body;
    
    // Validate required fields
    if (!slotId || !startTime || !serviceType || !customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }
    
    try {
      // Initialize Google Calendar service if not already done
      await googleCalendarService.initialize();
      
      // Create the appointment in Google Calendar
      const appointmentResult = await googleCalendarService.createAppointment({
        startTime,
        endTime,
        serviceType,
        customerName,
        customerEmail,
        customerPhone,
        notes
      });
      
      console.log('New booking created in Google Calendar:', {
        eventId: appointmentResult.eventId,
        serviceType,
        customerName,
        customerEmail,
        startTime
      });
      
      res.json({
        success: true,
        bookingId: appointmentResult.eventId,
        message: 'Appointment booked successfully',
        appointment: {
          id: appointmentResult.eventId,
          service: serviceType,
          startTime: appointmentResult.startTime,
          endTime: appointmentResult.endTime,
          eventLink: appointmentResult.eventLink,
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone
          },
          notes
        }
      });
    } catch (calendarError) {
      console.error('Failed to create appointment in Google Calendar:', calendarError);
      
      // Fallback: just log the booking and return success
      const bookingId = `booking_${Date.now()}`;
      
      console.log('Fallback booking (Calendar unavailable):', {
        bookingId,
        slotId,
        serviceType,
        customerName,
        customerEmail,
        startTime
      });
      
      res.json({
        success: true,
        bookingId: bookingId,
        message: 'Appointment booked successfully (confirmation pending)',
        appointment: {
          id: bookingId,
          service: serviceType,
          startTime,
          endTime,
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone
          },
          notes
        },
        fallback: true,
        warning: 'Calendar integration temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment'
    });
  }
});

module.exports = router;
