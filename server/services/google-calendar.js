const { google } = require("googleapis");
const moment = require("moment-timezone");

class GoogleCalendarService {
  constructor() {
    this.calendar = null;
    this.calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    this.timezone = "America/New_York"; // Force EST timezone
  }

  // Initialize Google Calendar API with service account or OAuth
  async initialize() {
    try {
      // Using service account (recommended for server-to-server)
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        console.log("DEBUG: Attempting to initialize Google Calendar API with service account");
        
        let serviceAccount;
        try {
          serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
          console.log("DEBUG: Service account JSON parsed successfully, project_id:", serviceAccount.project_id);
        } catch (parseError) {
          console.error("DEBUG: Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY JSON:", parseError.message);
          throw parseError;
        }

        // Decode the base64 private key
        try {
          if (!serviceAccount.private_key_base64) {
            throw new Error("private_key_base64 field missing from service account");
          }
          serviceAccount.private_key = Buffer.from(serviceAccount.private_key_base64, 'base64').toString('ascii');
          delete serviceAccount.private_key_base64; // Remove the base64 field
          console.log("DEBUG: Private key decoded successfully, length:", serviceAccount.private_key.length);
        } catch (keyError) {
          console.error("DEBUG: Failed to decode private key:", keyError.message);
          throw keyError;
        }

        const auth = new google.auth.GoogleAuth({
          credentials: serviceAccount,
          scopes: ["https://www.googleapis.com/auth/calendar"],
        });

        console.log("DEBUG: GoogleAuth object created, attempting to initialize calendar client");
        this.calendar = google.calendar({ version: "v3", auth });
        
        // Test the authentication by making a simple API call
        try {
          const testResponse = await this.calendar.calendarList.list();
          console.log("DEBUG: Calendar API test successful, found", testResponse.data.items?.length || 0, "calendars");
          console.log("DEBUG: Available calendars:", testResponse.data.items?.map(cal => ({ id: cal.id, summary: cal.summary })));
        } catch (testError) {
          console.error("DEBUG: Calendar API test failed:", testError.message);
          console.error("DEBUG: Error details:", testError.response?.data || testError);
          throw testError;
        }

        console.log("Google Calendar API initialized with service account successfully");
        return true;
      }

      // Fallback to OAuth (requires user consent)
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
      );

      // Set credentials if refresh token exists
      if (process.env.GOOGLE_REFRESH_TOKEN) {
        oauth2Client.setCredentials({
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        });

        this.calendar = google.calendar({ version: "v3", auth: oauth2Client });
        console.log("Google Calendar API initialized with OAuth");
        return true;
      }

      console.error("No Google Calendar credentials configured");
      return false;
    } catch (error) {
      console.error("Failed to initialize Google Calendar API:", error);
      return false;
    }
  }

  // Get available time slots for the next 30 days
  async getAvailableSlots(serviceType = "Premium Haircut", daysAhead = 30) {
    try {
      if (!this.calendar) {
        throw new Error("Google Calendar API not initialized");
      }

      const startDate = moment().tz(this.timezone).startOf("day");
      const endDate = moment()
        .tz(this.timezone)
        .add(daysAhead, "days")
        .endOf("day");

      // Get existing events to find busy times
      const busyTimes = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      // Generate available slots based on business hours
      const availableSlots = this.generateAvailableSlots(
        startDate,
        endDate,
        busyTimes.data.items || [],
        serviceType,
      );

      return availableSlots;
    } catch (error) {
      console.error("Error fetching available slots:", error);
      throw error;
    }
  }

  // Generate available time slots considering business hours and existing appointments
  generateAvailableSlots(startDate, endDate, busyEvents, serviceType) {
    const slots = [];
    const serviceDuration = this.getServiceDuration(serviceType);

    // Business hours configuration
    const businessHours = {
      monday: { start: 9, end: 19 }, // 9 AM - 7 PM
      tuesday: { start: 9, end: 19 },
      wednesday: { start: 9, end: 19 },
      thursday: { start: 9, end: 19 },
      friday: { start: 9, end: 19 },
      saturday: { start: 8, end: 18 }, // 8 AM - 6 PM
      sunday: { start: 10, end: 16 }, // 10 AM - 4 PM
    };

    const current = startDate.clone();

    while (current.isBefore(endDate)) {
      const dayName = current.format("dddd").toLowerCase();
      const hours = businessHours[dayName];

      if (hours && !this.isHoliday(current)) {
        // Generate slots for this day
        const daySlots = this.generateDaySlots(
          current,
          hours,
          serviceDuration,
          busyEvents,
        );
        slots.push(...daySlots);
      }

      current.add(1, "day");
    }

    return slots.slice(0, 50); // Limit to 50 slots for performance
  }

  // Generate available slots for a specific day
  generateDaySlots(date, businessHours, serviceDuration, busyEvents) {
    const slots = [];
    const slotInterval = 30; // 30-minute intervals

    let currentTime = date
      .clone()
      .hour(businessHours.start)
      .minute(0)
      .second(0);
    const endTime = date.clone().hour(businessHours.end).minute(0).second(0);

    while (
      currentTime
        .clone()
        .add(serviceDuration, "minutes")
        .isSameOrBefore(endTime)
    ) {
      const slotEnd = currentTime.clone().add(serviceDuration, "minutes");

      // Check if this slot conflicts with existing appointments
      const isAvailable = !busyEvents.some((event) => {
        const eventStart = moment(event.start.dateTime || event.start.date);
        const eventEnd = moment(event.end.dateTime || event.end.date);

        return currentTime.isBefore(eventEnd) && slotEnd.isAfter(eventStart);
      });

      if (isAvailable && currentTime.isAfter(moment())) {
        slots.push({
          id: `${currentTime.format("YYYY-MM-DD-HH-mm")}`,
          startTime: currentTime.clone().toISOString(),
          endTime: slotEnd.toISOString(),
          displayTime: currentTime.format("dddd, MMMM Do YYYY [at] h:mm A"),
          available: true,
        });
      }

      currentTime.add(slotInterval, "minutes");
    }

    return slots;
  }

  // Get service duration in minutes
  getServiceDuration(serviceType) {
    const durations = {
      "Premium Haircut": 30,
      "Basic Kids Cut": 30,
      "House Call Service": 30,
      "Same Day Appointment": 30,
    };

    return durations[serviceType] || 30;
  }

  // Check if date is a holiday (basic implementation)
  isHoliday(date) {
    // Add your holiday logic here
    const holidays = [
      "2024-12-25", // Christmas
      "2024-01-01", // New Year
      // Add more holidays as needed
    ];

    return holidays.includes(date.format("YYYY-MM-DD"));
  }

  // Create a new appointment
  async createAppointment(appointmentData) {
    try {
      if (!this.calendar) {
        throw new Error("Google Calendar API not initialized");
      }

      const startTime = moment(appointmentData.startTime).tz(this.timezone);
      const endTime = moment(appointmentData.endTime).tz(this.timezone);

      const event = {
        summary: `${appointmentData.serviceType} - ${appointmentData.customerName}`,
        description: this.buildEventDescription(appointmentData),
        start: {
          dateTime: startTime.toISOString(),
          timeZone: this.timezone,
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: this.timezone,
        },
        attendees: [
          {
            email: appointmentData.customerEmail,
            displayName: appointmentData.customerName,
          },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 }, // 24 hours before
            { method: "popup", minutes: 60 }, // 1 hour before
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        resource: event,
        sendUpdates: "all", // Send email notifications
      });

      console.log("Appointment created successfully:", response.data.id);
      return {
        success: true,
        eventId: response.data.id,
        eventLink: response.data.htmlLink,
        startTime: response.data.start.dateTime,
        endTime: response.data.end.dateTime,
      };
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  }

  // Build event description with customer details
  buildEventDescription(appointmentData) {
    return `
Appointment Details:
- Service: ${appointmentData.serviceType}
- Customer: ${appointmentData.customerName}
- Email: ${appointmentData.customerEmail}
- Phone: ${appointmentData.customerPhone || "Not provided"}
- Notes: ${appointmentData.notes || "None"}

Booked via: Booknow.Hair website
    `.trim();
  }

  // Get OAuth authorization URL (for initial setup)
  getAuthUrl() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    const scopes = ["https://www.googleapis.com/auth/calendar"];

    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    });
  }
}

module.exports = new GoogleCalendarService();
