import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";

const Header = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const openBooking = () => {
    window.open(
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2FER0ii_8nZuUakF7KarNHCkkPOVaGrBT9oa4=",
      "_blank",
    );
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-barber-200 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-barber-700" />
          <span className="text-xl font-semibold text-barber-900">
            Booknow.Hair
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("services")}
            className="text-barber-600 hover:text-barber-900 transition-colors"
          >
            Services
          </button>
          <button
            onClick={() => scrollToSection("gallery")}
            className="text-barber-600 hover:text-barber-900 transition-colors"
          >
            Gallery
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-barber-600 hover:text-barber-900 transition-colors"
          >
            Contact
          </button>
        </nav>

        <Button
          onClick={openBooking}
          className="bg-barber-900 hover:bg-barber-800 text-white px-6"
        >
          Book Now
        </Button>
      </div>
    </header>
  );
};

export default Header;
