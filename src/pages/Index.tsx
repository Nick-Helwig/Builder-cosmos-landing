import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import InstagramGallery from "@/components/InstagramGallery";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import InstagramTest from "@/components/InstagramTest";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <InstagramGallery />
        <ContactSection />
      </main>
      <Footer />
      {/* Debug component - remove after testing */}
      <InstagramTest />
    </div>
  );
};

export default Index;
