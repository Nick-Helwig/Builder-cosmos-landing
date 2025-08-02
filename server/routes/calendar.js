const express = require('express');
const router = express.Router();
const BookingScraper = require('../services/booking-scraper');
const googleCalendarService = require('../services/google-calendar');

console.log('Calendar routes module loaded.');

// Helper function to create known appointment slots
function createKnownAppointmentSlots() {
  const slots = [];
  const now = new Date();
  const knownTimes = ['6:15 PM', '6:45 PM', '7:15 PM', '7:45 PM', '8:15 PM', '8:45 PM', '9:15 PM', '9:45 PM'];
  
  // Create slots for the next 5 business days
  for (let i = 0; i < 10; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Use known appointment times
    knownTimes.forEach(timeStr => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      
      const startTime = new Date(date);
      startTime.setHours(hour, parseInt(minutes), 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);
      
      slots.push({
        id: `known_${date.getTime()}_${hour}_${minutes}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        displayTime: startTime.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          timeZone: 'America/New_York'
        }) + ' at ' + timeStr,
        available: true
      });
    });
    
    if (slots.length >= 20) break; // Limit total slots
  }
  
  return slots.slice(0, 20);
}

// Health check endpoint for calendar service
router.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    service: 'calendar',
    timestamp: new Date().toISOString()
  });
});

// Shared implementation for fetching available slots (extracted from /slots)
async function getAvailableTimesHandler(req, res) {
  try {
    const { service = 'Premium Haircut', days = 30 } = req.query;

    // 1) Try primary: Google Calendar API if credentials are configured
    let usedPrimary = false;
    try {
      const initialized = await googleCalendarService.initialize();
      if (initialized) {
        const slots = await googleCalendarService.getAvailableSlots(service, Number(days));
        if (Array.isArray(slots) && slots.length > 0) {
          console.log(`Returning ${slots.length} slots from google-calendar service`);
          return res.json({
            success: true,
            slots,
            service,
            source: 'google-calendar-api'
          });
        }
        usedPrimary = true;
        console.warn('Google Calendar returned no slots, falling back to scraper...');
      } else {
        console.warn('Google Calendar not initialized, falling back to scraper...');
      }
    } catch (gcErr) {
    console.error('Google Calendar primary flow failed, falling back:', gcErr?.message || gcErr);
    }

    console.log('[DIAGNOSTIC] Fetching appointment slots via booking page scraper...');
    // 2) Secondary: Booking page scraper with timeout
    const scraper = new BookingScraper();
    let scraperInitialized = false;

    // Check if forceFallback is enabled in the scraper immediately
    if (scraper.forceFallback) {
      console.log('Scraper forceFallback is true. Redirecting to Google Calendar booking page.');
      return res.json({
        success: true,
        redirectUrl: scraper.bookingUrl, // Provide the direct booking URL
        message: 'Redirecting to Google Calendar for booking.',
        source: 'force-fallback-redirect'
      });
    }

    try {
      scraperInitialized = await scraper.initialize();

      if (scraperInitialized) {
        console.log('Scraper initialized, attempting to scrape...');

        const slots = await Promise.race([
          scraper.scrapeAvailableSlots(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Scraper timeout after 30 seconds')), 30000)
          )
        ]);

        console.log(`Successfully scraped ${slots?.length || 0} appointment slots`);

        if (Array.isArray(slots) && slots.length > 0) {
          return res.json({
            success: true,
            slots,
            service,
            source: 'booking-page-scraper'
          });
        }

        console.log('Scraper returned empty results, using known appointment times...');
      } else {
        console.log('Scraper failed to initialize, trying known-times fallback...');
      }
    } catch (scraperError) {
      console.error('Scraper failed:', scraperError.message);
    } finally {
      if (scraperInitialized) {
        await scraper.close().catch(err =>
          console.error('Error closing scraper:', err.message)
        );
      }
    }

    // 3) Final fallback: known times
    const fallbackSlots = createKnownAppointmentSlots();
    return res.json({
      success: true,
      slots: fallbackSlots,
      service,
      source: usedPrimary ? 'google-then-known-times-fallback' : 'final-fallback-known-times'
    });
  } catch (error) {
    console.error('Calendar slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar slots'
    });
  }
}

/**
 * Add no-store to avoid stale caches and allow simple debug diagnostics.
 */
router.get('/slots', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.query.debug === 'true') {
    // Wrap original handler to inject diagnostics into the JSON body
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      try {
        const diag = {
          diagnostics: {
            service: body?.service || req.query.service || 'unknown',
            source: body?.source || 'unknown',
            count: Array.isArray(body?.slots) ? body.slots.length : 0,
            sample: Array.isArray(body?.slots) && body.slots.length > 0 ? body.slots.slice(0, 2) : [],
            now: new Date().toISOString(),
            path: '/api/calendar/slots'
          }
        };
        return originalJson({ ...body, ...diag });
      } catch {
        return originalJson(body);
      }
    };
  }
  return getAvailableTimesHandler(req, res);
});

// Compatibility alias: /available-times -> uses same logic as /slots
router.get('/available-times', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.query.debug === 'true') {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      try {
        const diag = {
          diagnostics: {
            service: body?.service || req.query.service || 'unknown',
            source: body?.source || 'unknown',
            count: Array.isArray(body?.slots) ? body.slots.length : 0,
            sample: Array.isArray(body?.slots) && body.slots.length > 0 ? body.slots.slice(0, 2) : [],
            now: new Date().toISOString(),
            path: '/api/calendar/available-times'
          }
        };
        return originalJson({ ...body, ...diag });
      } catch {
        return originalJson(body);
      }
    };
  }
  return getAvailableTimesHandler(req, res);
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
      const initialized = await googleCalendarService.initialize();
      if (!initialized) throw new Error('Google Calendar not configured');

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
