import { Scissors, Instagram, MapPin, Phone } from "lucide-react";

const Footer = () => {
  const openInstagram = () => {
    window.open("https://instagram.com/college_of_hair_design", "_blank");
  };

  return (
    <footer className="bg-barber-900 text-white py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Scissors className="h-6 w-6" />
              <span className="text-xl font-semibold">Booknow.Hair</span>
            </div>
            <p className="text-barber-300">
              Premium barbering experience with expert cuts, classic styles, and
              modern techniques.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <button
                onClick={() =>
                  document
                    .getElementById("services")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="block text-barber-300 hover:text-white transition-colors"
              >
                Services
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("gallery")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="block text-barber-300 hover:text-white transition-colors"
              >
                Gallery
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="block text-barber-300 hover:text-white transition-colors"
              >
                Contact
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-barber-300">
                <MapPin className="h-4 w-4" />
                <span>123 Main Street, Downtown</span>
              </div>
              <div className="flex items-center gap-2 text-barber-300">
                <Phone className="h-4 w-4" />
                <span>(123) 456-7890</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <button
              onClick={openInstagram}
              className="flex items-center gap-2 text-barber-300 hover:text-white transition-colors"
            >
              <Instagram className="h-4 w-4" />
              <span>@college_of_hair_design</span>
            </button>
          </div>
        </div>

        <div className="border-t border-barber-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-barber-400">
          <p className="text-sm sm:text-base">
            &copy; 2024 Booknow.Hair. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
