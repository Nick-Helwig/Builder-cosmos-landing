import { useState, useEffect } from "react";

interface InstagramImageProps {
  src: string;
  alt: string;
  className?: string;
}

const InstagramImage = ({ src, alt, className }: InstagramImageProps) => {
  // High-quality barbering fallback images
  const fallbackImages = [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1606330458767-b7374dccdb0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  ];

  // Determine if this is an Instagram URL that will be blocked
  const isInstagramUrl =
    src &&
    (src.includes("fbcdn.net") ||
      src.includes("cdninstagram.com") ||
      src.includes("instagram.") ||
      src.includes("facebook.com"));

  // Use a consistent fallback image based on the source URL to ensure same image for same post
  const fallbackIndex = src
    ? Math.abs(src.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) %
      fallbackImages.length
    : 0;
  const fallbackImage = fallbackImages[fallbackIndex];

  // For Instagram URLs, use fallback immediately. For other URLs, try to load normally.
  const actualSrc = isInstagramUrl ? fallbackImage : src;
  const [loading, setLoading] = useState(!isInstagramUrl);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isInstagramUrl) {
      console.log("Instagram URL detected, using fallback immediately:", src);
      setLoading(false);
    }
  }, [src, isInstagramUrl]);

  const handleImageLoad = () => {
    setLoading(false);
    if (!isInstagramUrl) {
      console.log("Image loaded successfully:", src);
    }
  };

  const handleImageError = () => {
    console.warn("Image failed to load:", src);
    setLoading(false);
    setImageError(true);
  };

  const finalSrc = imageError ? fallbackImage : actualSrc;

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-barber-100 animate-pulse flex items-center justify-center">
          <div className="text-xs text-barber-500">Loading...</div>
        </div>
      )}

      <img
        src={finalSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        referrerPolicy="no-referrer"
      />

      {isInstagramUrl && (
        <div className="absolute bottom-2 left-2 bg-gold-600/90 text-white text-xs px-2 py-1 rounded">
          Sample work
        </div>
      )}

      {imageError && !isInstagramUrl && (
        <div className="absolute bottom-2 left-2 bg-red-600/90 text-white text-xs px-2 py-1 rounded">
          Image failed
        </div>
      )}
    </div>
  );
};

export default InstagramImage;
