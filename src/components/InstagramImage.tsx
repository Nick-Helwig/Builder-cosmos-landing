import { useState } from "react";

interface InstagramImageProps {
  src: string;
  alt: string;
  className?: string;
}

const InstagramImage = ({ src, alt, className }: InstagramImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fallback image for when Instagram images fail to load
  const fallbackImage =
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

  const handleImageLoad = () => {
    setLoading(false);
    console.log("Instagram image loaded successfully:", src);
  };

  const handleImageError = () => {
    setLoading(false);
    setImageError(true);
    console.warn("Instagram image failed to load:", src);
  };

  // Try different approaches to load Instagram images
  const getImageSrc = () => {
    if (imageError) {
      return fallbackImage;
    }

    // If it's an Instagram CDN URL, try to proxy it
    if (src && src.includes("cdninstagram.com")) {
      const urlParts = src.split("cdninstagram.com");
      if (urlParts.length > 1) {
        const proxiedUrl = `/proxy/instagram-image${urlParts[1]}`;
        console.log("Using proxied Instagram image:", proxiedUrl);
        return proxiedUrl;
      }
    }

    // Try the original URL first
    return src;
  };

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-barber-100 animate-pulse flex items-center justify-center">
          <div className="text-xs text-barber-500">Loading...</div>
        </div>
      )}

      <img
        src={getImageSrc()}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />

      {imageError && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Using fallback
        </div>
      )}
    </div>
  );
};

export default InstagramImage;
