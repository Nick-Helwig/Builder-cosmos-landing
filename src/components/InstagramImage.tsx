import { useState, useEffect } from "react";

interface InstagramImageProps {
  src: string;
  alt: string;
  className?: string;
}

const InstagramImage = ({ src, alt, className }: InstagramImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fallback image for when proxy fails
  const fallbackImage =
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

  useEffect(() => {
    if (src) {
      // Check if it's an Instagram URL
      const isInstagramUrl =
        src.includes("scontent") ||
        src.includes("fbcdn.net") ||
        src.includes("cdninstagram.com");

      if (isInstagramUrl) {
        // Use AllOrigins proxy directly for Instagram images
        const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(src)}`;
        setImageSrc(proxiedUrl);
        console.log("Loading Instagram image via proxy:", proxiedUrl);
      } else {
        // For non-Instagram images, use directly
        setImageSrc(src);
      }
    }
  }, [src]);

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
    console.log("✅ Instagram image loaded successfully");
  };

  const handleImageError = () => {
    console.log("❌ Failed to load image, using fallback");
    setLoading(false);
    setError(true);
    setImageSrc(fallbackImage);
  };

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-barber-100 animate-pulse flex items-center justify-center">
          <div className="text-xs text-barber-500">Loading...</div>
        </div>
      )}

      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default InstagramImage;
