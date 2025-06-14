import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star } from "lucide-react";

const HeroSection = () => {
  const openBooking = () => {
    window.open(
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2FER0ii_8nZuUakF7KarNHCkkPOVaGrBT9oa4=",
      "_blank",
    );
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-barber-50 to-white flex items-center justify-center px-4 pt-20 sm:pt-24 lg:pt-16">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6 lg:space-y-8 animate-fade-in text-center lg:text-left order-2 lg:order-1">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-barber-900 leading-tight">
                Premium
                <span className="block text-gold-600">Barbering</span>
                <span className="block">Experience</span>
              </h1>
              <p className="text-lg sm:text-xl text-barber-600 max-w-lg mx-auto lg:mx-0">
                Expert cuts, classic styles, and modern techniques. Book your
                appointment with skilled professionals who care about your look.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={openBooking}
                size="lg"
                className="bg-barber-900 hover:bg-barber-800 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
              >
                Book Appointment
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  document
                    .getElementById("services")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="border-barber-300 text-barber-700 hover:bg-barber-50 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
              >
                View Services
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-8 text-sm text-barber-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Downtown Location</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Open 7 Days</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-gold-400 text-gold-400" />
                <span>5.0 Rating</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-slide-in order-1 lg:order-2 max-w-sm sm:max-w-md lg:max-w-none mx-auto">
            <div className="aspect-square rounded-2xl sm:rounded-3xl bg-gradient-to-br from-barber-100 to-barber-200 overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Professional barber at work"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-barber-200">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-barber-900">
                  500+
                </div>
                <div className="text-xs sm:text-sm text-barber-600">
                  Happy Clients
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
