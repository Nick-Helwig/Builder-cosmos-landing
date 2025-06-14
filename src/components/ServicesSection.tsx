import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Scissors, Waves, Sparkles } from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: <Scissors className="h-8 w-8" />,
      name: "Classic Cut",
      description: "Traditional scissor cut with precision styling",
      price: "$35",
      duration: "45 min",
      features: ["Consultation", "Wash & Style", "Hot Towel Finish"],
    },
    {
      icon: <Waves className="h-8 w-8" />,
      name: "Beard Trim",
      description: "Professional beard shaping and grooming",
      price: "$25",
      duration: "30 min",
      features: ["Beard Wash", "Precise Trimming", "Styling Products"],
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      name: "The Full Experience",
      description: "Complete grooming package with premium service",
      price: "$65",
      duration: "90 min",
      features: ["Haircut", "Beard Trim", "Hot Towel Shave", "Styling"],
    },
  ];

  const openBooking = () => {
    window.open(
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2FER0ii_8nZuUakF7KarNHCkkPOVaGrBT9oa4=",
      "_blank",
    );
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card
              key={index}
              className="border-barber-200 hover:shadow-xl transition-all duration-300 group"
            >
              <CardContent className="p-8">
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

                <div className="space-y-3 mb-6">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-gold-600" />
                      <span className="text-sm text-barber-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={openBooking}
                  className="w-full bg-barber-900 hover:bg-barber-800 text-white"
                >
                  Book This Service
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
