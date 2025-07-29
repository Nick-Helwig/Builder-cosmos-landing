import { Button } from "@/components/ui/button";
import { Scissors, Menu, X } from "lucide-react";
import { useState } from "react";
import CustomBookingModal from "./CustomBookingModal";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false); // Close mobile menu after navigation
  };

  const openBooking = () => {
    setIsBookingModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-barber-200 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="h-5 w-5 sm:h-6 sm:w-6 text-barber-700" />
          <span className="text-lg sm:text-xl font-semibold text-barber-900">
            Booknow.Hair
          </span>
        </div>

        {/* Desktop Navigation */}
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

        {/* Desktop Book Now Button */}
        <Button
          onClick={openBooking}
          className="hidden sm:flex bg-barber-900 hover:bg-barber-800 text-white px-4 sm:px-6"
        >
          Book Now
        </Button>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-barber-700"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/98 backdrop-blur-sm border-b border-barber-200 shadow-lg">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <button
              onClick={() => scrollToSection("services")}
              className="block w-full text-left py-2 text-barber-700 hover:text-barber-900 transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("gallery")}
              className="block w-full text-left py-2 text-barber-700 hover:text-barber-900 transition-colors"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="block w-full text-left py-2 text-barber-700 hover:text-barber-900 transition-colors"
            >
              Contact
            </button>
            <Button
              onClick={openBooking}
              className="w-full mt-4 bg-barber-900 hover:bg-barber-800 text-white"
            >
              Book Now
            </Button>
          </nav>
        </div>
      )}

      <CustomBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </header>
  );
};

export default Header;
