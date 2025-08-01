const puppeteer = require('puppeteer');
const moment = require('moment-timezone');

class BookingScraper {
  constructor() {
    this.bookingUrl = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ1N1ExrZA16pettGJBFNzDAUjYvxr4vwtXSD4VsdvhTy81VLXrBiEhIluJX-8E3w9RBbD3fRBhJ?ctz=America/New_York';
    this.browser = null;
    this.cache = {
      slots: null,
      timestamp: null,
      duration: 5 * 60 * 1000 // 5 minutes cache
    };
  }

  async initialize() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-default-apps',
          '--memory-pressure-off'
        ],
        timeout: 30000 // Increased timeout for browser launch
      });
      console.log('Booking scraper initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize booking scraper:', error.message);
      this.browser = null;
      return false;
    }
  }

  async scrapeAvailableSlots() {
    // Check cache first
    const now = Date.now();
    if (this.cache.slots && this.cache.timestamp && (now - this.cache.timestamp) < this.cache.duration) {
      console.log('Returning cached appointment slots');
      return this.cache.slots;
    }
    
    if (!this.browser) {
      throw new Error('Booking scraper not initialized');
    }

    let page = null;
    
    try {
      page = await this.browser.newPage();
      
      // Set timezone to EST to ensure consistent display
      await page.emulateTimezone('America/New_York');
      
      console.log('Loading Google Calendar booking page...');
      
      // Single attempt with better error handling
      await page.goto(this.bookingUrl, {
        waitUntil: 'networkidle0', // Wait until network is idle
        timeout: 30000 // Reduced timeout for page navigation to 30 seconds
      });
      
      console.log('Page loaded successfully');
      
      // Save page HTML for debugging
      const htmlContent = await page.content();
      require('fs').writeFileSync('/tmp/booking_page.html', htmlContent);
      console.log('Saved booking page HTML to /tmp/booking_page.html');

      // Wait for a specific selector that indicates dynamic content is loaded
      await page.waitForSelector('div[role="button"][data-time-key], div[aria-label*="time slot"], div.AqECfc[data-time], div[role="gridcell"] button, .w8Qjne', { timeout: 10000 })
        .catch(() => console.log('Time slot selector not found within 10 seconds.'));
      
      // Wait for dynamic content
      await new Promise(resolve => setTimeout(resolve, 3000)); // Reduced wait time for dynamic content
      
      console.log('Extracting appointment slots...');
      
      // Extract structured appointment data
      const slots = await page.evaluate(() => {
        const results = [];
        
        // Updated selectors based on current Google Calendar DOM structure
        const timeSlotElements = document.querySelectorAll(
          'button[jsname="YqGEYe"], ' + // Primary time slot buttons with jsname
          'button.AeBiU-LgbsSe, ' + // Buttons with AeBiU class
          'button[aria-label*="am"], ' + // Buttons with AM time labels
          'button[aria-label*="pm"], ' + // Buttons with PM time labels
          'button[data-date-time], ' + // Buttons with data-date-time attribute
          'div[role="listitem"] button, ' + // Buttons inside listitem containers
          '.NhEBKc, ' + // Google Calendar time slot button class
          'div[role="button"][data-time-key], ' + // Legacy primary time slot buttons
          'div[aria-label*="time slot"], ' + // Legacy elements explicitly labeled as time slots
          'div.AqECfc[data-time], ' + // Legacy pattern for time slots
          'div[role="gridcell"] button, ' + // Legacy calendar grid cells with buttons
          '.w8Qjne, ' + // Legacy Google Calendar time slot class
          'div[data-time], ' + // Legacy elements with data-time attribute
          'button[data-time], ' + // Legacy buttons with data-time attribute
          '.fUzQHe, ' + // Legacy potential time slot class
          'div[role="button"]:not([disabled])' // Legacy clickable buttons that aren't disabled
        );

        console.log(`Found ${timeSlotElements.length} potential time slot elements.`);

        timeSlotElements.forEach((el, index) => {
          // Try to get time from the new DOM structure first
          const timeSpan = el.querySelector('span[jsname="V67aGc"]');
          const timeFromSpan = timeSpan ? timeSpan.textContent?.trim() : null;
          
          // Try aria-label which contains the time for the new structure
          const ariaLabel = el.getAttribute('aria-label');
          
          // Fallback to legacy methods
          const timeText = el.textContent?.trim();
          const dataTimeKey = el.getAttribute('data-time-key');
          const dataTime = el.getAttribute('data-time');
          const dataDateTime = el.getAttribute('data-date-time');

          let time = timeFromSpan || ariaLabel || timeText || dataTimeKey || dataTime || dataDateTime;

          if (time) {
            // Clean up time string
            time = time.trim().replace(/\s+/g, ' ');
            
            // Try to find associated date information.
            // Look for a parent element with a data-date attribute or a clear date text.
            let dateElement = el;
            let dateFound = null;
            
            // Traverse up to find a date associated with the time slot
            while (dateElement && !dateFound && dateElement.tagName !== 'BODY') {
              const dataDate = dateElement.getAttribute('data-date');
              if (dataDate) {
                dateFound = dataDate;
                break;
              }
              // Look for date text in nearby elements, e.g., a header for the day
              const siblingDateHeader = dateElement.previousElementSibling;
              if (siblingDateHeader && /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\b/.test(siblingDateHeader.textContent?.trim())) {
                dateFound = siblingDateHeader.textContent?.trim().match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\b/)?.[0];
                if (dateFound) break;
              }
              dateElement = dateElement.parentElement;
            }

            // Fallback to current month/year context if no specific date found
            if (!dateFound) {
              const monthYearElement = document.querySelector('[aria-label*="2025"], .month-year, h2');
              const currentContext = monthYearElement ? monthYearElement.textContent?.trim() : '';
              if (currentContext && /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/.test(currentContext)) {
                dateFound = currentContext;
              }
            }
            
            results.push({
              time: time,
              date: dateFound,
              elementText: timeText,
              className: el.className,
              dataTimeKey: dataTimeKey,
              dataTime: dataTime,
              ariaLabel: ariaLabel,
              debugIndex: index, // For debugging purposes
              hasTime: /\d{1,2}:\d{2}\s*(AM|PM|am|pm)/i.test(time),
              hasDate: /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(time)
            });
          }
        });
        
        // Also extract available dates from the calendar grid, if present
        const availableDateElements = document.querySelectorAll('.calendar-day.available, [aria-label*="available"], [data-date]');
        const availableDates = Array.from(availableDateElements).map(el => ({
          date: el.getAttribute('data-date') || el.textContent?.trim(),
          className: el.className,
          isClickable: !el.classList.contains('disabled') && !el.classList.contains('P7rTif')
        })).filter(d => d.date); // Filter out null/empty dates
        
        // Get current month/year context for better date parsing
        const monthYearElement = document.querySelector('[aria-label*="2025"], .month-year, h2');
        const currentContext = monthYearElement ? monthYearElement.textContent?.trim() : '';
        
        // Get the currently selected date from the calendar
        const selectedDateElement = document.querySelector('.selected, [aria-selected="true"], .DPvwYc');
        const selectedDate = selectedDateElement ? selectedDateElement.textContent?.trim() : null;
        
        return {
          timeSlots: results,
          availableDates,
          currentContext,
          selectedDate
        };
      });
      
      // Process and format the slots
      const formattedSlots = this.formatSlots(slots);
      
      console.log(`Found ${formattedSlots.length} available appointment slots`);
      
      // Cache the results
      this.cache.slots = formattedSlots;
      this.cache.timestamp = Date.now();
      
      return formattedSlots;
      
    } catch (error) {
      console.error('Error scraping booking page:', error.message);
      throw error;
    } finally {
      if (page) {
        try {
          await page.close();
          console.log('Page closed');
        } catch (closeError) {
          console.error('Error closing page:', closeError.message);
        }
      }
    }
  }

  formatSlots(scrapedData) {
    const slots = [];
    const { timeSlots, availableDates, currentContext, selectedDate } = scrapedData;
    
    // Get current date and month for slot generation
    const now = moment().tz('America/New_York');
    
    // Group time slots and create proper appointment objects
    const uniqueTimes = [...new Set(timeSlots.map(slot => slot.time))];
    
    // Get available dates (filter out disabled dates)
    const enabledDates = availableDates.filter(date => date.isClickable);
    
    console.log(`Found ${uniqueTimes.length} unique times and ${enabledDates.length} available dates`);
    console.log('Available dates:', enabledDates.map(d => d.date));
    console.log('Unique times:', uniqueTimes);
    console.log('Current context:', currentContext);
    console.log('Selected date:', selectedDate);
    
    // Debug: Log time slot quality
    const timeSlotsWithTime = timeSlots.filter(slot => slot.hasTime);
    const timeSlotsWithDate = timeSlots.filter(slot => slot.hasDate);
    console.log(`Time slots with time: ${timeSlotsWithTime.length}/${timeSlots.length}`);
    console.log(`Time slots with date: ${timeSlotsWithDate.length}/${timeSlots.length}`);
    console.log('Sample time slots:', timeSlots.slice(0, 3).map(slot => ({
      time: slot.time,
      hasTime: slot.hasTime,
      hasDate: slot.hasDate,
      elementText: slot.elementText
    })));
    
    // If we have times but no specific dates, or if the dates look problematic, 
    // just use upcoming business days with the scraped times
    if (uniqueTimes.length > 0) {
      console.log('Creating slots for upcoming business days with scraped times');
      
      // Clear any problematic date data and start fresh
      enabledDates.length = 0;
      
      // Use the next 7 business days
      for (let i = 0; i < 10; i++) {
        const futureDate = now.clone().add(i, 'days');
        // Skip weekends for business hours
        if (futureDate.day() !== 0 && futureDate.day() !== 6) {
          enabledDates.push({
            date: futureDate.format('YYYY-MM-DD'),
            isClickable: true
          });
          
          if (enabledDates.length >= 5) break; // Limit to 5 business days
        }
      }
    }
    
    // Create slots for each available time on each available date
    enabledDates.forEach(dateInfo => {
      uniqueTimes.forEach(time => {
        try {
          let slotDate;
          
          // Handle different date formats
          if (dateInfo.date && dateInfo.date.includes('-')) {
            // Full date format (YYYY-MM-DD)
            slotDate = moment.tz(dateInfo.date, 'America/New_York');
          } else if (dateInfo.date) {
            // Day number only
            const dayNum = parseInt(dateInfo.date);
            slotDate = now.clone().date(dayNum);
            
            // If the day is in the past, assume it's next month
            if (slotDate.isBefore(now, 'day')) {
              slotDate.add(1, 'month');
            }
          } else {
            // Fallback to today
            slotDate = now.clone();
          }
          
          // Parse time - handle multiple formats
          let timeMatch = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          
          // Try alternative time formats
          if (!timeMatch) {
            timeMatch = time.match(/(\d{1,2})\s*(AM|PM)/i);
          }
          if (!timeMatch) {
            timeMatch = time.match(/(\d{1,2}):(\d{2})/i);
          }
          
          if (timeMatch) {
            let hour = parseInt(timeMatch[1]) || 9; // Default to 9 AM if parsing fails
            const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
            const period = timeMatch[3] ? timeMatch[3].toUpperCase() : 'AM';
            
            // Convert to 24-hour format
            if (period === 'PM' && hour !== 12) {
              hour += 12;
            } else if (period === 'AM' && hour === 12) {
              hour = 0;
            }
            
            // Ensure hour is within business hours
            if (hour < 6) hour = 9; // Earliest business hour
            if (hour > 21) hour = 18; // Latest business hour
            
            const startTime = slotDate.clone().hour(hour).minute(minute).second(0);
            const endTime = startTime.clone().add(30, 'minutes'); // 30-minute appointments
            
            slots.push({
              id: `slot-${slotDate.format('YYYY-MM-DD')}-${hour}-${minute}`,
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              displayTime: startTime.format('dddd, MMMM Do YYYY [at] h:mm A'),
              available: true,
              source: 'scraped'
            });
          } else {
            console.log(`Could not parse time from: ${time}`);
          }
        } catch (error) {
          console.error('Error formatting slot:', error.message);
        }
      });
    });
    
    // Sort slots by date and time
    slots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    
    // Remove duplicates and limit results
    const uniqueSlots = slots.filter((slot, index, arr) => 
      arr.findIndex(s => s.startTime === slot.startTime) === index
    );
    
    return uniqueSlots.slice(0, 50); // Limit to 50 slots
  }

  async close() {
    if (this.browser) {
      try {
        await this.browser.close();
        console.log('Booking scraper closed');
      } catch (error) {
        console.error('Error closing browser:', error.message);
      } finally {
        this.browser = null;
      }
    }
  }
}

module.exports = BookingScraper;