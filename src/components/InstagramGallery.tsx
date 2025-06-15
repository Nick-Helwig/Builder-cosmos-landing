import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

const InstagramGallery = () => {
  const [instagramPosts, setInstagramPosts] = useState([
    // Fallback images while Instagram API loads
    {
      id: "fallback1",
      image:
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      alt: "Classic fade haircut",
      permalink: "https://instagram.com/college_of_hair_design",
    },
    {
      id: "fallback2",
      image:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      alt: "Beard trim and styling",
      permalink: "https://instagram.com/college_of_hair_design",
    },
    {
      id: "fallback3",
      image:
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      alt: "Modern undercut style",
      permalink: "https://instagram.com/college_of_hair_design",
    },
    {
      id: "fallback4",
      image:
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      alt: "Professional haircut",
      permalink: "https://instagram.com/college_of_hair_design",
    },
    {
      id: "fallback5",
      image:
        "https://images.unsplash.com/photo-1606330458767-b7374dccdb0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      alt: "Stylish beard grooming",
      permalink: "https://instagram.com/college_of_hair_design",
    },
    {
      id: "fallback6",
      image:
        "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      alt: "Fresh cut and style",
      permalink: "https://instagram.com/college_of_hair_design",
    },
  ]);

  // Fetch Instagram posts from API
  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        // Instagram Basic Display API call
        // You'll need to replace this with your actual Instagram API endpoint
        const response = await fetch("/api/instagram-feed");
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            const formattedPosts = data.data.slice(0, 6).map((post: any) => ({
              id: post.id,
              image: post.media_url,
              alt:
                post.caption || "Instagram post from @college_of_hair_design",
              permalink: post.permalink,
            }));
            setInstagramPosts(formattedPosts);
          }
        }
      } catch (error) {
        console.log("Instagram API not configured, using fallback images");
        // Keep fallback images if API fails
      }
    };

    fetchInstagramPosts();
  }, []);

  const openInstagram = () => {
    window.open("https://instagram.com/college_of_hair_design", "_blank");
  };

  return (
    <section id="gallery" className="py-16 sm:py-20 lg:py-24 bg-barber-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-barber-900 mb-4 sm:mb-6">
            Our Recent Work
          </h2>
          <p className="text-lg sm:text-xl text-barber-600 max-w-2xl mx-auto mb-6 sm:mb-8">
            See our latest cuts and styles on Instagram @college_of_hair_design
          </p>

          <Button
            onClick={openInstagram}
            variant="outline"
            className="border-barber-300 text-barber-700 hover:bg-barber-100 text-sm sm:text-base"
          >
            <Instagram className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Follow Us on Instagram</span>
            <span className="sm:hidden">Follow Us</span>
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {instagramPosts.map((post, index) => (
            <Card
              key={post.id}
              className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => window.open(post.permalink, "_blank")}
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Instagram className="h-8 w-8 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-barber-600 mb-4">
            Want to see more? Follow us for daily updates and style inspiration
          </p>
          <Button
            onClick={openInstagram}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
          >
            <Instagram className="h-4 w-4 mr-2" />
            @college_of_hair_design
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InstagramGallery;
