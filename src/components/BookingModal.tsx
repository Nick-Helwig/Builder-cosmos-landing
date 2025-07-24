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
  const handleIframeLoad = () => {
    // Attempt to override timezone detection in the iframe
    try {
      const iframe = document.querySelector('iframe[title="Book Appointment - Eastern Time"]') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        // Override timezone detection functions
        const script = `
          (function() {
            // Override Intl.DateTimeFormat to always return Eastern Time
            const originalDateTimeFormat = Intl.DateTimeFormat;
            Intl.DateTimeFormat = function(...args) {
              if (args.length === 0 || !args[1] || !args[1].timeZone) {
                args[1] = args[1] || {};
                args[1].timeZone = 'America/New_York';
              }
              return new originalDateTimeFormat(...args);
            };

            // Override Date.prototype.getTimezoneOffset to return EST offset
            Date.prototype.getTimezoneOffset = function() {
              return 300; // EST is UTC-5 (300 minutes)
            };

            // Override timezone detection
            if (window.Intl && window.Intl.DateTimeFormat) {
              const original = window.Intl.DateTimeFormat().resolvedOptions;
              window.Intl.DateTimeFormat.prototype.resolvedOptions = function() {
                const options = original.call(this);
                options.timeZone = 'America/New_York';
                return options;
              };
            }
          })();
        `;

        // Create and inject script
        const scriptElement = iframe.contentDocument?.createElement('script');
        if (scriptElement) {
          scriptElement.textContent = script;
          iframe.contentDocument?.head?.appendChild(scriptElement);
        }
      }
    } catch (error) {
      // Cross-origin restrictions prevent this approach
      console.log('Cannot modify iframe content due to cross-origin restrictions');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[95vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl font-semibold text-barber-900">
            Book Your Appointment
          </DialogTitle>
          <DialogDescription className="text-barber-600">
            Select your preferred time and date from our available slots below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-6 pb-6 min-h-0">
          <div className="w-full h-full rounded-lg overflow-auto border border-barber-200">
            <iframe
              src="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1N1ExrZA16pettGJBFNzDAUjYvxr4vwtXSD4VsdvhTy81VLXrBiEhIluJX-8E3w9RBbD3fRBhJ?ctz=America/New_York&tz=America/New_York&timezone=America/New_York&force_tz=America/New_York"
              className="w-full h-[600px] min-h-[600px]"
              style={{ border: 0 }}
              frameBorder="0"
              scrolling="yes"
              title="Book Appointment - Eastern Time"
              onLoad={handleIframeLoad}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
