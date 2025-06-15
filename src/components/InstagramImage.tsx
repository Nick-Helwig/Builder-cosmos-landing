import { useState } from "react";

interface InstagramImageProps {
  src: string;
  alt: string;
  className?: string;
}

const InstagramImage = ({ src, alt, className }: InstagramImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fallback image for when Instagram images fail to load
  const fallbackImage =
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

  const handleImageLoad = () => {
    setLoading(false);
    console.log("Instagram image loaded successfully:", src);
  };

  const handleImageError = () => {
    console.warn(
      "Instagram image failed to load:",
      src,
      "Retry count:",
      retryCount,
    );

    if (retryCount < 2) {
      // Try different URL strategies
      setRetryCount(retryCount + 1);
      return;
    }

    setLoading(false);
    setImageError(true);
  };

  // Try different approaches to load Instagram images
  const getImageSrc = () => {
    if (imageError) {
      return fallbackImage;
    }

    // Try different strategies based on retry count
    if (retryCount === 0) {
      // First try: Original URL
      return src;
    } else if (retryCount === 1 && src && src.includes("cdninstagram.com")) {
      // Second try: Use our proxy for Instagram CDN
      const urlParts = src.split("cdninstagram.com");
      if (urlParts.length > 1) {
        const proxiedUrl = `/proxy/instagram-image${urlParts[1]}`;
        console.log("Retry 1: Using proxied Instagram image:", proxiedUrl);
        return proxiedUrl;
      }
    } else if (retryCount === 2) {
      // Third try: Use public CORS proxy
      const corsProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(src)}`;
      console.log("Retry 2: Using CORS proxy:", corsProxy);
      return corsProxy;
    }

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

      {retryCount > 0 && !imageError && (
        <div className="absolute top-2 right-2 bg-blue-500/70 text-white text-xs px-2 py-1 rounded">
          Retry {retryCount}
        </div>
      )}
    </div>
  );
};

export default InstagramImage;
