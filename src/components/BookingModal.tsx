import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const openCalendarInNewWindow = () => {
    // Open calendar in new window - often respects timezone settings better
    const calendarUrl = "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1N1ExrZA16pettGJBFNzDAUjYvxr4vwtXSD4VsdvhTy81VLXrBiEhIluJX-8E3w9RBbD3fRBhJ?ctz=America/New_York&tz=America/New_York&timezone=America/New_York";
    window.open(calendarUrl, "_blank", "width=800,height=700,scrollbars=yes,resizable=yes");
    onClose(); // Close the modal since we're opening in new window
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl font-semibold text-barber-900">
            Book Your Appointment
          </DialogTitle>
          <DialogDescription className="text-barber-600">
            Click below to open our booking calendar in a new window.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="text-center space-y-6">
            <div className="bg-barber-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-barber-900 mb-2">
                Quick & Easy Booking
              </h3>
              <p className="text-barber-600 text-sm mb-4">
                Our calendar will open in a new window where you can:
              </p>
              <ul className="text-left text-sm text-barber-600 space-y-2 max-w-md mx-auto">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
                  View available time slots
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
                  Select your preferred service
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
                  Book instantly with confirmation
                </li>
              </ul>
            </div>

            <button
              onClick={openCalendarInNewWindow}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-barber-900 hover:bg-barber-800 text-white h-12 px-8 text-lg w-full"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Open Booking Calendar
            </button>

            <p className="text-xs text-barber-500">
              A new window will open with our appointment scheduler
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
