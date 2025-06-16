import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Phone, Calendar } from "lucide-react";
import { useState } from "react";
import BookingModal from "./BookingModal";

const ContactSection = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const openBooking = () => {
    setIsBookingModalOpen(true);
  };

  const openMaps = () => {
    window.open("https://maps.google.com/?q=barber+shop+near+me", "_blank");
  };

  const callPhone = () => {
    window.open("tel:+1234567890", "_self");
  };

  return (
    <section id="contact" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-barber-900 mb-4 sm:mb-6">
            Ready to Look Your Best?
          </h2>
          <p className="text-lg sm:text-xl text-barber-600 max-w-2xl mx-auto">
            Book your appointment today and experience the difference
            professional barbering makes
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          <div className="space-y-6 sm:space-y-8">
            <Card className="border-barber-200">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-barber-700 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-barber-900 mb-2">
                      Location
                    </h3>
                    <p className="text-barber-600 mb-4">
                      123 Main Street
                      <br />
                      Downtown District
                      <br />
                      Your City, ST 12345
                    </p>
                    <Button
                      onClick={openMaps}
                      variant="outline"
                      size="sm"
                      className="border-barber-300 text-barber-700 hover:bg-barber-50"
                    >
                      Get Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-barber-200">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-barber-700 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-barber-900 mb-2">
                      Hours
                    </h3>
                    <div className="space-y-1 text-barber-600 text-sm sm:text-base">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span>9:00 AM - 7:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span>8:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span>10:00 AM - 4:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-barber-200">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-barber-700 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-barber-900 mb-2">
                      Contact
                    </h3>
                    <p className="text-barber-600 mb-4">
                      Call us for walk-ins or questions
                      <br />
                      (123) 456-7890
                    </p>
                    <Button
                      onClick={callPhone}
                      variant="outline"
                      size="sm"
                      className="border-barber-300 text-barber-700 hover:bg-barber-50"
                    >
                      Call Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-center mt-8 lg:mt-0">
            <Card className="border-barber-200 w-full max-w-md">
              <CardContent className="p-6 sm:p-8 text-center">
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-barber-700 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl font-semibold text-barber-900 mb-3 sm:mb-4">
                  Book Your Appointment
                </h3>
                <p className="text-barber-600 mb-6 sm:mb-8 text-sm sm:text-base">
                  Choose your preferred time slot and let us take care of the
                  rest. Easy online booking available 24/7.
                </p>
                <Button
                  onClick={openBooking}
                  size="lg"
                  className="w-full bg-barber-900 hover:bg-barber-800 text-white text-base sm:text-lg py-4 sm:py-6"
                >
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Book Online Now
                </Button>
                <p className="text-xs sm:text-sm text-barber-500 mt-3 sm:mt-4">
                  Instant confirmation • No waiting
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </section>
  );
};

export default ContactSection;
