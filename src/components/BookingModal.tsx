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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] max-h-[800px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-semibold text-barber-900">
            Book Your Appointment
          </DialogTitle>
          <DialogDescription className="text-barber-600">
            Select your preferred time and date from our available slots below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-6 pb-6">
          <div className="w-full h-full rounded-lg overflow-hidden border border-barber-200">
            <iframe
              src="https://calendar.google.com/calendar/embed?src=a9e7b779de91b65c7b309ea0c8538307a9f6fc259589a0e25622218775a9b264%40group.calendar.google.com&ctz=UTC"
              className="w-full h-full min-h-[500px]"
              style={{ border: 0 }}
              frameBorder="0"
              scrolling="no"
              title="Book Appointment"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
