import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Scissors, Users, Home, Phone } from "lucide-react";
import { useState } from "react";
import BookingModal from "./BookingModal";

const ServicesSection = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const services = [
    {
      icon: <Scissors className="h-8 w-8" />,
      name: "Premium Haircut",
      description:
        "Custom tailored haircut with fading, tapering, blending and texturing",
      price: "$35",
      duration: "30 min",
      features: [
        "Includes beard trim",
        "Eyebrow styling",
        "Professional styling",
        "Hot towel finish",
      ],
    },
    {
      icon: <Users className="h-8 w-8" />,
      name: "Basic Kids Cut",
      description: "Simple, clean cuts perfect for children 15 and under",
      price: "$25",
      duration: "30 min",
      features: [
        "Ages 15 and under",
        "No fades",
        "Quick & gentle service",
        "Kid-friendly approach",
      ],
    },
    {
      icon: <Home className="h-8 w-8" />,
      name: "House Call Service",
      description: "Concierge-style service at your convenience",
      price: "$110",
      duration: "30 min",
      features: [
        "Service at your location",
        "Professional equipment",
        "Contact for group bookings",
        "Ultimate convenience",
      ],
    },
    {
      icon: <Phone className="h-8 w-8" />,
      name: "Same Day Appointment",
      description: "Unable to book online? Call for same-day accommodation",
      price: "$65",
      duration: "30 min",
      features: [
        "Contact via phone",
        "Same day availability",
        "Flexible scheduling",
        "Personal accommodation",
      ],
    },
  ];

  const openBooking = () => {
    setIsBookingModalOpen(true);
  };

  const callPhone = () => {
    window.open("tel:7169940608", "_self");
  };

  return (
    <section id="services" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-barber-900 mb-4 sm:mb-6">
            Our Services
          </h2>
          <p className="text-lg sm:text-xl text-barber-600 max-w-2xl mx-auto">
            Choose from our range of professional services, each designed to
            give you the perfect look
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <Card
              key={index}
              className="border-barber-200 hover:shadow-xl transition-all duration-300 group h-full"
            >
              <CardContent className="p-8 h-full flex flex-col">
                <div className="text-barber-700 mb-4 group-hover:text-gold-600 transition-colors">
                  {service.icon}
                </div>

                <h3 className="text-2xl font-semibold text-barber-900 mb-2">
                  {service.name}
                </h3>

                <p className="text-barber-600 mb-4">{service.description}</p>

                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-bold text-barber-900">
                    {service.price}
                  </span>
                  <span className="text-sm text-barber-500">
                    {service.duration}
                  </span>
                </div>

                <div className="space-y-3 mb-6 flex-grow">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-gold-600" />
                      <span className="text-sm text-barber-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={
                    service.name === "House Call Service" ||
                    service.name === "Same Day Appointment"
                      ? callPhone
                      : openBooking
                  }
                  className="w-full bg-barber-900 hover:bg-barber-800 text-white"
                >
                  {service.name === "House Call Service" ||
                  service.name === "Same Day Appointment"
                    ? "Call to make appointment"
                    : "Book Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </section>
  );
};

export default ServicesSection;
