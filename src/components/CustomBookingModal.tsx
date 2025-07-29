import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Mail, Phone, CheckCircle, Loader2 } from "lucide-react";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  displayTime: string;
  available: boolean;
}

interface CustomBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomBookingModal = ({ isOpen, onClose }: CustomBookingModalProps) => {
  const [step, setStep] = useState(1); // 1: Select Service, 2: Select Time, 3: Customer Info, 4: Confirmation
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [serverAvailable, setServerAvailable] = useState(false);
  const [fallbackToIframe, setFallbackToIframe] = useState(false);

  const services = [
    { name: "Premium Haircut", price: "$35", duration: "30 min" },
    { name: "Basic Kids Cut", price: "$25", duration: "30 min" },
    { name: "House Call Service", price: "$110", duration: "30 min" },
    { name: "Same Day Appointment", price: "$65", duration: "30 min" },
  ];

  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

  // Check if server is available on modal open
  useEffect(() => {
    if (isOpen) {
      checkServerAvailability();
    }
  }, [isOpen]);

  const checkServerAvailability = async () => {
    // Skip server check if no server URL is configured for production
    if (!import.meta.env.VITE_SERVER_URL && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      console.log("No calendar server configured for production, using fallback");
      setServerAvailable(false);
      setFallbackToIframe(true);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${serverUrl}/api/calendar/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });

      clearTimeout(timeoutId);
      setServerAvailable(response.ok);

      if (!response.ok) {
        setFallbackToIframe(true);
      }
    } catch (error) {
      console.log("Calendar server not available, using fallback");
      setServerAvailable(false);
      setFallbackToIframe(true);
    }
  };

  // Fetch available slots when service is selected
  useEffect(() => {
    if (selectedService && step === 2) {
      fetchAvailableSlots();
    }
  }, [selectedService, step]);

  const fetchAvailableSlots = async () => {
    if (!serverAvailable) {
      setFallbackToIframe(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `${serverUrl}/api/calendar/slots?service=${encodeURIComponent(selectedService)}&days=30`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch slots: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSlots(data.slots);
      } else {
        throw new Error(data.error || "Failed to load available slots");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      setFallbackToIframe(true);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleBooking = async () => {
    if (!selectedSlot || !selectedService) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${serverUrl}/api/calendar/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          serviceType: selectedService,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          notes: customerInfo.notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setBookingResult(result);
        setStep(4);
      } else {
        throw new Error(result.message || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setError("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedService("");
    setSelectedSlot(null);
    setCustomerInfo({ name: "", email: "", phone: "", notes: "" });
    setError("");
    setBookingResult(null);
    setSlots([]);
    setFallbackToIframe(false);
    setServerAvailable(false);
  };

  const handleClose = () => {
    resetBooking();
    onClose();
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={fallbackToIframe ? "max-w-4xl w-full max-h-[95vh] p-0 flex flex-col" : "max-w-2xl w-full max-h-[90vh] overflow-y-auto"}>
        <DialogHeader className={fallbackToIframe ? "p-6 pb-4 flex-shrink-0" : ""}>
          <DialogTitle className="text-2xl font-semibold text-barber-900 flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Book Your Appointment
          </DialogTitle>
          <DialogDescription>
            {fallbackToIframe ? "Select your preferred time and date from our available slots below." : (
              <>
                {step === 1 && "Choose your service"}
                {step === 2 && "Select your preferred time"}
                {step === 3 && "Enter your information"}
                {step === 4 && "Booking confirmed!"}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Fallback to Google Calendar iframe when server is unavailable */}
        {fallbackToIframe && (
          <div className="flex-1 px-6 pb-6 min-h-0">
            <div className="w-full h-full rounded-lg overflow-auto border border-barber-200">
              <iframe
                src="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1N1ExrZA16pettGJBFNzDAUjYvxr4vwtXSD4VsdvhTy81VLXrBiEhIluJX-8E3w9RBbD3fRBhJ?ctz=America/New_York"
                className="w-full h-[600px] min-h-[600px]"
                style={{ border: 0 }}
                frameBorder="0"
                scrolling="yes"
                title="Book Appointment"
              />
            </div>
          </div>
        )}

        {/* Custom booking interface when server is available */}
        {!fallbackToIframe && (
          <div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-barber-900">Select a Service</h3>
            <div className="grid gap-3">
              {services.map((service, index) => (
                <button
                  key={index}
                  onClick={() => handleServiceSelect(service.name)}
                  className="p-4 border border-barber-200 rounded-lg hover:border-barber-400 hover:bg-barber-50 transition-colors text-left"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-barber-900">{service.name}</h4>
                      <p className="text-sm text-barber-600">{service.duration}</p>
                    </div>
                    <span className="text-lg font-semibold text-barber-900">{service.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Time Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-barber-900">
                Available Times for {selectedService}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
                className="text-barber-600"
              >
                Change Service
              </Button>
            </div>

            <p className="text-sm text-barber-600">
              All times shown in Eastern Time. Select your preferred appointment time:
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-barber-600" />
                <span className="ml-2 text-barber-600">Loading available times...</span>
              </div>
            ) : slots.length > 0 ? (
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot)}
                    className="p-3 border border-barber-200 rounded-lg hover:border-barber-400 hover:bg-barber-50 transition-colors text-left flex items-center gap-3"
                  >
                    <Clock className="h-4 w-4 text-barber-600" />
                    <span className="text-barber-900">{slot.displayTime}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-barber-600">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-barber-300" />
                <p>No available times found.</p>
                <p className="text-sm">Please try selecting a different service or contact us directly.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Customer Information */}
        {step === 3 && selectedSlot && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-barber-900">Your Information</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(2)}
                className="text-barber-600"
              >
                Change Time
              </Button>
            </div>

            <div className="bg-barber-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-barber-900 mb-2">Appointment Summary</h4>
              <p className="text-sm text-barber-600">
                <strong>Service:</strong> {selectedService}
              </p>
              <p className="text-sm text-barber-600">
                <strong>Time:</strong> {formatDateTime(selectedSlot.startTime)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-barber-900">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-barber-900">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="Enter your email address"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-barber-900">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-barber-900">
                  Special Requests or Notes
                </Label>
                <Textarea
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                  placeholder="Any special requests or additional information..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <Button
              onClick={handleBooking}
              disabled={!customerInfo.name || !customerInfo.email || loading}
              className="w-full bg-barber-900 hover:bg-barber-800 text-white py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Booking Appointment...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && bookingResult && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h3 className="text-xl font-semibold text-barber-900">
              Appointment Booked Successfully!
            </h3>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                Your appointment has been confirmed and added to our calendar.
                You'll receive an email confirmation shortly.
              </p>
            </div>

            <div className="text-left bg-barber-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-barber-900">Appointment Details:</h4>
              <p className="text-sm text-barber-600">
                <strong>Service:</strong> {selectedService}
              </p>
              <p className="text-sm text-barber-600">
                <strong>Date & Time:</strong> {selectedSlot && formatDateTime(selectedSlot.startTime)}
              </p>
              <p className="text-sm text-barber-600">
                <strong>Name:</strong> {customerInfo.name}
              </p>
              <p className="text-sm text-barber-600">
                <strong>Email:</strong> {customerInfo.email}
              </p>
            </div>

            <Button
              onClick={handleClose}
              className="w-full bg-barber-900 hover:bg-barber-800 text-white"
            >
              Close
            </Button>
          </div>
        )}

        ) /* Close custom booking interface wrapper */}
      </DialogContent>
    </Dialog>
  );
};

export default CustomBookingModal;